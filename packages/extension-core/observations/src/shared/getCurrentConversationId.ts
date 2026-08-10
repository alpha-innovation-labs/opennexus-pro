import type { ExtensionCommandContext, ExtensionContext } from "@earendil-works/pi-coding-agent";
import { getPersistentConversationId } from "./getPersistentConversationId";

/**
 * Reads the current persisted conversation identifier when available.
 *
 * @param ctx Pi extension context.
 * @returns Current conversation identifier, if persisted.
 */
export function getCurrentConversationId(ctx: ExtensionContext | ExtensionCommandContext): string | undefined {
	const sessionFile = ctx.sessionManager.getSessionFile();
	return sessionFile ? getPersistentConversationId(sessionFile) : undefined;
}
