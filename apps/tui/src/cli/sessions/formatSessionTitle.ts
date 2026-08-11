import type { SessionInfo } from "@earendil-works/pi-coding-agent";

/**
 * Formats the display title for a resumable session.
 *
 * @param session Session metadata from the session manager.
 * @returns Session name, first message, or an untitled placeholder.
 */
export function formatSessionTitle(session: Pick<SessionInfo, "name" | "firstMessage">): string {
  const title = (session.name ?? session.firstMessage).replace(new RegExp("[\u0000-\u001f\u007f]", "g"), " ").trim();
  return title.length > 0 ? title : "(untitled)";
}
