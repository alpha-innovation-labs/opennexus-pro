import { createLineFingerprint, normalizeLine } from "./createLineChatKey.js";
import type { LineChatSessionMetadata } from "./types.js";

/**
 * Splits line chats into active and obsolete groups for the current file snapshot.
 */
export function reconcileLineChatSessions(lines: string[], sessions: LineChatSessionMetadata[]): { active: LineChatSessionMetadata[]; obsolete: LineChatSessionMetadata[] } {
	const active: LineChatSessionMetadata[] = [];
	const obsolete: LineChatSessionMetadata[] = [];
	for (const session of sessions) {
		const currentLine = lines[session.lineNumber - 1];
		const currentFingerprint = createLineFingerprint(lines, session.lineNumber);
		const sameLineExists = currentLine !== undefined && normalizeLine(currentLine) === normalizeLine(session.lineText);
		const sameContextExists = currentLine !== undefined && currentFingerprint === session.lineFingerprint;
		(sameLineExists || sameContextExists ? active : obsolete).push({ ...session, status: sameLineExists || sameContextExists ? "active" : "obsolete" });
	}
	return { active, obsolete };
}
