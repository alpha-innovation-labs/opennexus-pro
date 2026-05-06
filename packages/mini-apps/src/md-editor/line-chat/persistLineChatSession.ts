import { writeFile } from "node:fs/promises";
import path from "node:path";
import { createLineChatKey } from "./createLineChatKey.js";
import { getLineChatSessionDir } from "./getLineChatSessionDir.js";
import type { LineChatSession } from "./types.js";

/**
 * Persists one hidden md-editor line-chat session outside the resumable session index.
 */
export async function persistLineChatSession(sessionDir: string, session: LineChatSession): Promise<{ sessionPath: string }> {
	const dir = await getLineChatSessionDir(sessionDir);
	const key = createLineChatKey(session.metadata.filePath, session.metadata.lineNumber);
	const sessionPath = path.join(dir, `${key}.json`);
	await writeFile(sessionPath, `${JSON.stringify(session, null, 2)}\n`, "utf8");
	return { sessionPath };
}
