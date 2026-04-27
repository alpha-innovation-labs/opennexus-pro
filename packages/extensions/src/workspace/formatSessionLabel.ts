import { truncateToWidth } from "@mariozechner/pi-tui";
import { SessionManager } from "@mariozechner/pi-coding-agent";

/**
 * Formats a single session into a compact selector label.
 *
 * @param session Session metadata from Pi.
 * @returns Compact session label.
 */
export function formatSessionLabel(session: Awaited<ReturnType<typeof SessionManager.list>>[number]): string {
	const name = (session.name || session.firstMessage || "Untitled session").trim();
	const title = truncateToWidth(name, 40, "…");
	const count = `${session.messageCount} msg`;
	return `${title} — ${count}`;
}
