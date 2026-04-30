import type { ExtensionAPI, ExtensionContext } from "@mariozechner/pi-coding-agent";
import { normalizePromptlineTitleContent } from "./normalizePromptlineTitleContent.js";

/**
 * Reads the status title from the session name or latest user prompt.
 *
 * @param getSessionName Pi session name getter.
 * @param ctx Extension context with session branch access.
 * @returns Trimmed display title, or undefined when no title source exists.
 */
export function getPromptlineStatusTitle(
	getSessionName: ExtensionAPI["getSessionName"],
	ctx: Pick<ExtensionContext, "sessionManager">,
): string | undefined {
	const sessionName = getSessionName()?.trim();
	if (sessionName) return sessionName;

	const branch = ctx.sessionManager.getBranch();
	for (let index = branch.length - 1; index >= 0; index -= 1) {
		const entry = branch[index] as { type?: string; message?: { role?: string; content?: unknown }; content?: unknown };
		if (entry.type === "message" && entry.message?.role === "user") return normalizePromptlineTitleContent(entry.message.content);
		if (entry.type === "custom_message") return normalizePromptlineTitleContent(entry.content);
	}

	return undefined;
}
