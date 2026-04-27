import type { MarkdownFileSnapshot } from "../file/computeMarkdownFileSnapshot.js";
import { createLineChatKey, createLineFingerprint } from "./createLineChatKey.js";
import type { LineChatSession } from "./types.js";

/**
 * Creates an empty hidden session record for one selected Markdown line.
 */
export function createInitialLineChatSession(snapshot: MarkdownFileSnapshot, lineNumber: number): LineChatSession {
	const now = new Date().toISOString();
	return {
		sessionId: createLineChatKey(snapshot.filePath, lineNumber),
		metadata: {
			kind: "md-editor-line-chat",
			hiddenFromResume: true,
			filePath: snapshot.filePath,
			lineNumber,
			lineText: snapshot.lines[lineNumber - 1] ?? "",
			lineFingerprint: createLineFingerprint(snapshot.lines, lineNumber),
			status: "active",
			lastContextContentHash: snapshot.contentHash,
			lastContextMtimeMs: snapshot.mtimeMs,
			updatedAt: now,
		},
		messages: [],
	};
}
