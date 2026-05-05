import { resolve } from "node:path";
import { getSmartEvalsDir } from "./getSmartEvalsDir.js";

/**
 * Resolves the rendered smart-eval markdown path.
 *
 * @param conversationId Conversation identifier.
 * @returns Absolute smart-eval markdown path.
 */
export function getSmartEvalMarkdownPath(conversationId: string): string {
	return resolve(getSmartEvalsDir(), `${conversationId}.evals.md`);
}
