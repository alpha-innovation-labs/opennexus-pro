import type { SubagentRun } from "@nexus/extensions/sub-agents/types.js";
import type { LineChatSession } from "../line-chat/types.js";

/**
 * Adapts a persisted md-editor line chat to the shared Tron transcript renderer shape.
 */
export function toLineChatSubagentRun(session: LineChatSession): SubagentRun {
	return {
		id: session.sessionId,
		title: `Line ${session.metadata.lineNumber}`,
		prompt: "",
		cwd: session.metadata.filePath,
		subagentType: "md-editor-line-chat",
		status: "completed",
		background: true,
		createdAt: Date.parse(session.metadata.updatedAt),
		resultText: "",
		liveAssistantText: "",
		liveThinkingText: "",
		activeTool: null,
		transcript: session.messages.map((message) => ({ role: message.role, text: message.content, createdAt: Date.parse(message.timestamp), toolCallId: message.toolCallId, toolName: message.toolName, args: message.args, result: message.result })),
		client: null,
		toolCalls: session.messages.filter((message) => message.role === "tool").length,
		contextProviderIds: [],
	};
}
