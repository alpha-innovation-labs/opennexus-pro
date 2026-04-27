import { readFile } from "node:fs/promises";
import path from "node:path";
import { createLineChatKey } from "./createLineChatKey.js";
import { getLineChatSessionDir } from "./getLineChatSessionDir.js";
import type { LineChatSession } from "./types.js";

/**
 * Reads one persisted per-line chat session, returning undefined when absent.
 */
export async function readLineChatSession(sessionDir: string, filePath: string, lineNumber: number): Promise<LineChatSession | undefined> {
	const dir = await getLineChatSessionDir(sessionDir);
	const sessionPath = path.join(dir, `${createLineChatKey(filePath, lineNumber)}.json`);
	try {
		const session = JSON.parse(await readFile(sessionPath, "utf8")) as LineChatSession;
		if (session.messages.some((message) => message.content.includes("You are the right-panel md-editor chat inside Nexus."))) return undefined;
		return session;
	} catch (error) {
		if ((error as NodeJS.ErrnoException).code === "ENOENT") return undefined;
		throw error;
	}
}
