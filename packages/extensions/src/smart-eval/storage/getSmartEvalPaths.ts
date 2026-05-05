import type { ExtensionContext } from "@mariozechner/pi-coding-agent";
import { getPersistentConversationId } from "../../observations/shared/getPersistentConversationId.js";
import { getSmartEvalsDir } from "./getSmartEvalsDir.js";
import { getSmartEvalMarkdownPath } from "./getSmartEvalMarkdownPath.js";
import { getSmartEvalStatePath } from "./getSmartEvalStatePath.js";

/**
 * Resolves all storage paths needed by smart-eval.
 *
 * @param ctx Pi extension context.
 * @returns Smart-eval identifiers and paths.
 */
export function getSmartEvalPaths(ctx: ExtensionContext): {
	conversationId: string | undefined;
	sessionFile: string | null;
	dir: string;
	statePath?: string;
	markdownPath?: string;
} {
	const sessionFile = ctx.sessionManager.getSessionFile() ?? null;
	const conversationId = sessionFile ? getPersistentConversationId(sessionFile) : undefined;
	return {
		conversationId,
		sessionFile,
		dir: getSmartEvalsDir(),
		statePath: conversationId ? getSmartEvalStatePath(conversationId) : undefined,
		markdownPath: conversationId ? getSmartEvalMarkdownPath(conversationId) : undefined,
	};
}
