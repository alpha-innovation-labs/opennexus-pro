import type { AgentMessage } from "@earendil-works/pi-agent-core";
import type { LineChatMessage } from "../line-chat/types.js";

/**
 * Converts real AgentSession messages to md-editor transcript messages for rendering.
 */
export function extractAgentMessages(messages: AgentMessage[]): LineChatMessage[] {
	const extracted: LineChatMessage[] = [];
	for (const message of messages) {
		const timestamp = new Date((message as { timestamp?: number }).timestamp ?? Date.now()).toISOString();
		if (message.role === "user") extracted.push({ role: "user", content: contentToText(message.content), timestamp });
		if (message.role === "assistant") extracted.push(...assistantContentToMessages(message.content, timestamp));
		if (message.role === "toolResult") attachToolResult(extracted, message, timestamp);
	}
	return extracted.filter((message) => message.content.trim().length > 0 || message.role === "tool");
}

/**
 * Extracts text from user/tool content arrays or strings.
 */
function contentToText(content: unknown): string {
	if (typeof content === "string") return content;
	if (!Array.isArray(content)) return "";
	return content.map((part) => typeof part?.text === "string" ? part.text : "").filter(Boolean).join("\n");
}

/**
 * Extracts assistant text, thinking, and tool calls as separate Tron transcript rows.
 */
function assistantContentToMessages(content: unknown, timestamp: string): LineChatMessage[] {
	if (!Array.isArray(content)) return [];
	return content.flatMap((part) => {
		if (typeof part?.text === "string") return [{ role: "assistant" as const, content: part.text, timestamp }];
		if (typeof part?.thinking === "string") return [{ role: "thinking" as const, content: part.thinking, timestamp }];
		if (part?.type === "toolCall") return [{ role: "tool" as const, content: `Tool call: ${part.name}`, timestamp, toolCallId: part.id, toolName: part.name, args: part.arguments ?? {} }];
		return [];
	});
}

/**
 * Attaches a tool result to the existing tool-call row instead of creating a duplicate row.
 */
function attachToolResult(extracted: LineChatMessage[], message: Extract<AgentMessage, { role: "toolResult" }>, timestamp: string): void {
	const existingTool = [...extracted].reverse().find((entry) => entry.role === "tool" && entry.toolCallId === message.toolCallId);
	const result = { isError: message.isError, content: message.content, details: message.details };
	if (existingTool) {
		existingTool.result = result;
		return;
	}
	extracted.push({ role: "tool", content: contentToText(message.content), timestamp, toolCallId: message.toolCallId, toolName: message.toolName, result });
}
