import { extractAssistantText } from "../rpc/extractAssistantText.js";
import { shorten } from "../rpc/shorten.js";
import { toolPreview } from "../rpc/toolPreview.js";
import type { PlaygroundAgentEvent, PlaygroundState } from "../types.js";
import { appendTranscriptEntry } from "./appendTranscriptEntry.js";
import { finalizeAssistantMessage } from "./finalizeAssistantMessage.js";
import { getPlaygroundPane } from "./getPlaygroundPane.js";
import { requestPlaygroundRender } from "./requestPlaygroundRender.js";

/**
 * Applies one streamed child-process event to one playground pane.
 *
 * @param state Playground runtime state.
 * @param paneKey Target pane key.
 * @param event RPC child-process event.
 */
export function handlePlaygroundEvent(state: PlaygroundState, paneKey: string, event: PlaygroundAgentEvent): void {
	const pane = getPlaygroundPane(state, paneKey);
	switch (event.type) {
		case "agent_start": {
			pane.busy = true;
			pane.status = "Running…";
			requestPlaygroundRender(state);
			return;
		}
		case "agent_end": {
			pane.busy = false;
			pane.status = "Ready";
			requestPlaygroundRender(state);
			return;
		}
		case "message_update": {
			if (event.assistantMessageEvent?.type === "text_delta" && event.assistantMessageEvent.delta) {
				pane.liveAssistantText += event.assistantMessageEvent.delta;
				pane.status = "Streaming response…";
				requestPlaygroundRender(state);
			}
			return;
		}
		case "message_end": {
			if (event.message?.role === "assistant") {
				finalizeAssistantMessage(pane, extractAssistantText(event));
				if (event.message.errorMessage) {
					appendTranscriptEntry(pane, { role: "error", text: event.message.errorMessage });
				}
				requestPlaygroundRender(state);
			}
			return;
		}
		case "tool_execution_start": {
			finalizeAssistantMessage(pane);
			appendTranscriptEntry(pane, { role: "tool", text: toolPreview(event.toolName, event.args) });
			pane.status = `Running ${event.toolName ?? "tool"}…`;
			requestPlaygroundRender(state);
			return;
		}
		case "tool_execution_end": {
			if (event.isError) {
				const text = event.result?.content?.find((part) => part.type === "text")?.text;
				appendTranscriptEntry(pane, { role: "error", text: shorten(text ?? `${event.toolName ?? "tool"} failed`, 120) });
				requestPlaygroundRender(state);
			}
			return;
		}
		default:
			return;
	}
}
