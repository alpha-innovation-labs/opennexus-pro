import { readFile } from "node:fs/promises";
import { createEmptySmartEvalState } from "./createEmptySmartEvalState.js";
import { updateSmartEvalSummary } from "./updateSmartEvalSummary.js";
import type { SmartEvalState, StoredSmartEvalTurn } from "../types.js";

/**
 * Reads persisted smart-eval state from disk.
 *
 * @param statePath Smart-eval state path.
 * @param conversationId Conversation identifier.
 * @param cwd Working directory.
 * @param sessionFile Session file path.
 * @returns Parsed smart-eval state.
 */
export async function readSmartEvalState(
	statePath: string,
	conversationId: string,
	cwd: string,
	sessionFile: string | null,
): Promise<SmartEvalState> {
	try {
		const parsed = JSON.parse(await readFile(statePath, "utf8")) as Partial<SmartEvalState>;
		const state: SmartEvalState = {
			conversationId,
			cwd,
			sessionFile,
			updatedAt: typeof parsed.updatedAt === "number" ? parsed.updatedAt : Date.now(),
			summary: typeof parsed.summary === "string" ? parsed.summary : "",
			turns: Array.isArray(parsed.turns) ? parsed.turns.filter(isStoredSmartEvalTurn) : [],
		};
		updateSmartEvalSummary(state);
		return state;
	} catch {
		return createEmptySmartEvalState(conversationId, cwd, sessionFile);
	}
}

/**
 * Checks whether a parsed value is a stored smart-eval turn.
 *
 * @param value Parsed value.
 * @returns True when the value has the required persisted fields.
 */
function isStoredSmartEvalTurn(value: unknown): value is StoredSmartEvalTurn {
	const turn = value as StoredSmartEvalTurn;
	if (typeof turn?.assistantTimestamp !== "number" || typeof turn?.result?.assistantTimestamp !== "number" || !Array.isArray(turn.result.questions)) return false;
	if (typeof turn.turnId !== "string") turn.turnId = String(turn.assistantTimestamp);
	return true;
}
