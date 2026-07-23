import type { LineChatSession } from "../line-chat/types.js";

/**
 * Adapts a persisted md-editor line chat to the shared transcript renderer shape.
 */
export function toLineChatSubagentRun(session: LineChatSession) {
	return {
		transcript: session.messages.map((message) => ({
			role: message.role,
			text: message.content,
			createdAt: Date.parse(message.timestamp),
			toolCallId: message.toolCallId,
			toolName: message.toolName,
			args: message.args,
			result: message.result,
		})),
	};
}
