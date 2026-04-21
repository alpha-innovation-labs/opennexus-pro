import type { SubagentRun } from "../types.js";
import { appendSubagentTranscriptEntry } from "./appendSubagentTranscriptEntry.js";
import { createToolPreview } from "./createToolPreview.js";
import { extractAssistantTextFromRpcMessage } from "./extractAssistantTextFromRpcMessage.js";

/**
 * Finds the latest transcript tool entry for one tool call id.
 *
 * @param run Target run.
 * @param toolCallId Tool call id.
 * @returns Matching transcript entry, if found.
 */
function findLatestToolEntry(run: SubagentRun, toolCallId: string | undefined) {
  if (!toolCallId) return undefined;
  for (let index = run.transcript.length - 1; index >= 0; index -= 1) {
    const entry = run.transcript[index];
    if (entry.role === "tool" && entry.toolCallId === toolCallId) return entry;
  }
  return undefined;
}

/**
 * Applies one streamed RPC event to one tracked subagent run.
 *
 * @param run Target run.
 * @param event RPC event payload.
 */
export function applySubagentEvent(run: SubagentRun, event: any): void {
  switch (event?.type) {
    case "agent_start": {
      run.status = "running";
      run.startedAt = Date.now();
      return;
    }
    case "agent_end": {
      run.completedAt = Date.now();
      if (run.status !== "error" && run.status !== "aborted") run.status = "completed";
      return;
    }
    case "message_update": {
      if (event.assistantMessageEvent?.type === "text_delta") {
        run.liveAssistantText += event.assistantMessageEvent.delta ?? "";
      }
      if (event.assistantMessageEvent?.type === "thinking_delta") {
        run.liveThinkingText += event.assistantMessageEvent.delta ?? "";
      }
      return;
    }
    case "message_end": {
      if (event.message?.role !== "assistant") return;
      const text = extractAssistantTextFromRpcMessage(event.message);
      run.resultText = text || run.liveAssistantText;
      if (run.liveThinkingText.trim()) {
        appendSubagentTranscriptEntry(run, { role: "thinking", text: run.liveThinkingText.trim() });
      }
      if (run.resultText.trim()) {
        appendSubagentTranscriptEntry(run, { role: "assistant", text: run.resultText.trim() });
      }
      run.liveAssistantText = "";
      run.liveThinkingText = "";
      return;
    }
    case "tool_execution_start": {
      run.toolCalls += 1;
      run.activeTool = {
        toolName: event.toolName ?? "tool",
        args: event.args,
        outputText: "",
        startedAt: Date.now(),
      };
      appendSubagentTranscriptEntry(run, {
        role: "tool",
        text: createToolPreview(event.toolName, event.args),
        toolCallId: event.toolCallId,
        toolName: event.toolName,
        args: event.args,
      });
      return;
    }
    case "tool_execution_update": {
      if (!run.activeTool) return;
      const outputText = event.partialResult?.content
        ?.filter((part: any) => part?.type === "text")
        .map((part: any) => part?.text ?? "")
        .join("\n")
        .trim() ?? "";
      run.activeTool.outputText = outputText;
      return;
    }
    case "tool_execution_end": {
      const matchingToolEntry = findLatestToolEntry(run, event.toolCallId);
      if (matchingToolEntry) {
        matchingToolEntry.result = {
          isError: Boolean(event.isError),
          content: event.result?.content,
          details: event.result?.details,
        };
      }
      if (event.isError) {
        const errorText = extractAssistantTextFromRpcMessage(event.result) || `${event.toolName ?? "tool"} failed`;
        appendSubagentTranscriptEntry(run, { role: "error", text: errorText });
        run.lastError = errorText;
      }
      if (run.activeTool) run.activeTool.finishedAt = Date.now();
      run.activeTool = null;
      return;
    }
    default:
      return;
  }
}
