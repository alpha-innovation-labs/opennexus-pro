import { persistLineChatSession } from "./persistLineChatSession.js";
import type { LineChatSession } from "./types.js";

/**
 * Marks a line-chat session obsolete after its source line is deleted.
 */
export async function markLineChatSessionObsolete(sessionDir: string, session: LineChatSession): Promise<LineChatSession> {
	const next: LineChatSession = { ...session, metadata: { ...session.metadata, status: "obsolete", updatedAt: new Date().toISOString() } };
	await persistLineChatSession(sessionDir, next);
	return next;
}
