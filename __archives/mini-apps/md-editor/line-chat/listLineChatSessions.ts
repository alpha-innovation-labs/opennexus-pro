import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { getLineChatSessionDir } from "./getLineChatSessionDir.js";
import type { LineChatSession } from "./types.js";

/**
 * Lists persisted md-editor line-chat sessions for the current project session directory.
 */
export async function listLineChatSessions(sessionDir: string): Promise<LineChatSession[]> {
	const dir = await getLineChatSessionDir(sessionDir);
	let names: string[] = [];
	try {
		names = await readdir(dir);
	} catch {
		return [];
	}
	const sessions = await Promise.all(names.filter((name) => name.endsWith(".json")).map(async (name) => JSON.parse(await readFile(path.join(dir, name), "utf8")) as LineChatSession));
	return sessions.filter((session) => !session.messages.some((message) => message.content.includes("You are the right-panel md-editor chat inside Nexus.")));
}
