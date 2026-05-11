import type { AutomationChatMessage } from "../modal/types.js";

type AgentMessage = { role?: string; content?: unknown };

/**
 * Converts agent session messages to automation chat messages.
 *
 * @param messages Raw agent messages.
 * @returns Renderable chat messages.
 */
export function toAutomationChatMessages(messages: AgentMessage[]): AutomationChatMessage[] {
	return messages.flatMap((message) => {
		if (message.role !== "user" && message.role !== "assistant") return [];
		const content = typeof message.content === "string" ? message.content : JSON.stringify(message.content);
		return [{ role: message.role, content, createdAt: new Date().toISOString() } satisfies AutomationChatMessage];
	});
}
