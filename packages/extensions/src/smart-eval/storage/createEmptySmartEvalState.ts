import type { SmartEvalState } from "../types.js";

/**
 * Creates an empty smart-eval state object matching observation-style metadata.
 *
 * @param conversationId Conversation identifier.
 * @param cwd Working directory.
 * @param sessionFile Session file path.
 * @returns Empty smart-eval state.
 */
export function createEmptySmartEvalState(conversationId: string, cwd: string, sessionFile: string | null): SmartEvalState {
	return {
		conversationId,
		cwd,
		sessionFile,
		updatedAt: Date.now(),
		summary: "No evaluated turns yet.",
		turns: [],
	};
}
