import type { ExtensionCommandContext } from "@earendil-works/pi-coding-agent";
import { renderTranscriptLines } from "@nexus/extensions/tron/transcript/renderTranscriptLines.js";
import type { LineChatMessage, LineChatSession } from "../line-chat/types.js";
import { renderTronInputLines } from "./renderTronInputLines.js";
import { toLineChatSubagentRun } from "./toLineChatSubagentRun.js";

/**
 * Renders the right-panel line chat through the shared Tron transcript renderer.
 */
export function renderLineChat(session: LineChatSession | undefined, input: string, width: number, theme: ExtensionCommandContext["ui"]["theme"], statusLines: string[] = []): string[] {
	const transcript = renderTranscript(session, width, theme);
	return [...transcript, ...statusLines, "", ...renderTronInputLines(input, width, theme)];
}

/**
 * Renders persisted messages through the same Tron path used by subagent history.
 */
function renderTranscript(session: LineChatSession | undefined, width: number, theme: ExtensionCommandContext["ui"]["theme"]): string[] {
	if (!session || session.messages.length === 0) return [theme.fg("muted", "No chat for this line yet.")];
	return renderTranscriptLines(theme, width, toLineChatSubagentRun(selectLatestExchange(session)));
}

/**
 * Keeps the right pane focused on the latest exchange so Tron frames are not split by viewport slicing.
 */
function selectLatestExchange(session: LineChatSession): LineChatSession {
	const messages = normalizeToolResultRows(session.messages);
	const lastUserIndex = messages.map((message) => message.role).lastIndexOf("user");
	if (lastUserIndex <= 0) return { ...session, messages };
	return { ...session, messages: messages.slice(lastUserIndex) };
}

/**
 * Merges legacy separate tool-result rows back into their matching tool-call row for Tron grouping.
 */
function normalizeToolResultRows(messages: LineChatMessage[]): LineChatMessage[] {
	const normalized: LineChatMessage[] = [];
	for (const message of messages) {
		const matchingTool = message.role === "tool" && message.toolCallId
			? [...normalized].reverse().find((entry) => entry.role === "tool" && entry.toolCallId === message.toolCallId)
			: undefined;
		const isResultOnlyTool = message.role === "tool" && !message.args && !message.content.startsWith("Tool call:");
		if (matchingTool && isResultOnlyTool) {
			matchingTool.result = message.result ?? { isError: false, content: [{ type: "text", text: message.content }] };
			continue;
		}
		normalized.push({ ...message });
	}
	return normalized;
}
