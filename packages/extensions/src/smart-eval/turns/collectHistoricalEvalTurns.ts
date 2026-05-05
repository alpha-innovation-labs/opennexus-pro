import type { SmartEvalTurn } from "../types.js";
import { extractContentText } from "./extractContentText.js";
import { extractThinkingText } from "./extractThinkingText.js";

interface SessionEntryLike {
	type?: string;
	id?: string;
	message?: {
		role?: string;
		content?: unknown;
		timestamp?: number;
		toolCallId?: string;
		isError?: boolean;
		details?: unknown;
	};
}

/**
 * Collects user/assistant historical turns from a session branch.
 *
 * @param branch Session branch entries.
 * @returns Turns that already have completed assistant responses.
 */
export function collectHistoricalEvalTurns(branch: SessionEntryLike[]): SmartEvalTurn[] {
	const turns: SmartEvalTurn[] = [];
	let currentUserText = "";
	let pendingAssistant: SmartEvalTurn | undefined;

	for (const entry of branch) {
		if (entry.type !== "message" || !entry.message) continue;
		if (entry.message.role === "user") {
			currentUserText = extractContentText(entry.message.content);
			pendingAssistant = undefined;
			continue;
		}
		if (entry.message.role === "assistant") {
			const assistantTimestamp = entry.message.timestamp;
			if (typeof assistantTimestamp !== "number" || !currentUserText.trim()) continue;
			pendingAssistant = {
				turnId: entry.id ?? String(assistantTimestamp),
				userText: currentUserText,
				assistantText: extractContentText(entry.message.content),
				thinkingText: extractThinkingText(entry.message.content),
				toolText: "",
				assistantTimestamp,
			};
			turns.push(pendingAssistant);
			continue;
		}
		if (entry.message.role === "toolResult" && pendingAssistant) {
			const label = entry.message.isError ? "tool error" : "tool result";
			pendingAssistant.toolText += `${label}: ${extractContentText(entry.message.content)}\n`;
		}
	}

	return turns.filter((turn) => turn.assistantText.trim() || turn.thinkingText.trim() || turn.toolText.trim());
}
