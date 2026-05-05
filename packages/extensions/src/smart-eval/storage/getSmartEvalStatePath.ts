import { resolve } from "node:path";
import { getSmartEvalsDir } from "./getSmartEvalsDir.js";

/**
 * Resolves the structured smart-eval state path.
 *
 * @param conversationId Conversation identifier.
 * @returns Absolute smart-eval state path.
 */
export function getSmartEvalStatePath(conversationId: string): string {
	return resolve(getSmartEvalsDir(), `${conversationId}.state.json`);
}
