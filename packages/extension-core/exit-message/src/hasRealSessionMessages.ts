import type { ExtensionContext } from "@earendil-works/pi-coding-agent";

type SessionEntryLike = { type?: string };

type SessionManagerLike = Pick<
	ExtensionContext,
	"sessionManager"
>["sessionManager"] & {
	getBranch?: () => SessionEntryLike[];
	getEntries?: () => SessionEntryLike[];
};

/**
 * Checks whether the current session has at least one persisted conversation message.
 *
 * @param ctx Extension context with a session manager.
 * @returns True when there is a real resumable conversation.
 */
export function hasRealSessionMessages(
	ctx?: Pick<ExtensionContext, "sessionManager">,
): boolean {
	const sessionManager = ctx?.sessionManager as SessionManagerLike | undefined;
	const entries =
		sessionManager?.getEntries?.() ?? sessionManager?.getBranch?.() ?? [];
	return entries.some((entry) => entry.type === "message");
}
