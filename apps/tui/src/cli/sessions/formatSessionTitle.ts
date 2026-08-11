import type { SessionInfo } from "@earendil-works/pi-coding-agent";

/**
 * Formats the display title for a resumable session.
 *
 * @param session Session metadata from the session manager.
 * @returns Session name, first message, or an untitled placeholder.
 */
export function formatSessionTitle(
	session: Pick<SessionInfo, "name" | "firstMessage">,
): string {
	const title = (session.name ?? session.firstMessage)
		.split("")
		.filter((c) => {
			const code = c.charCodeAt(0);
			return !(
				code === 0 ||
				(code >= 1 && code <= 8) ||
				code === 11 ||
				code === 12 ||
				(code >= 14 && code <= 31) ||
				code === 127
			);
		})
		.join("")
		.trim();
	return title.length > 0 ? title : "(untitled)";
}
