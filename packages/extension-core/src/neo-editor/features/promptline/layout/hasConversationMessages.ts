import type { ExtensionContext } from "@earendil-works/pi-coding-agent";

/**
 * Checks whether the active session branch contains conversation messages.
 *
 * @param ctx Extension context with the current session manager.
 * @returns True when a message-like session entry exists in the current branch.
 */
export function hasConversationMessages(ctx: Pick<ExtensionContext, "sessionManager">): boolean {
	return ctx.sessionManager.getBranch().some((entry) => entry.type === "message" || entry.type === "custom_message");
}
