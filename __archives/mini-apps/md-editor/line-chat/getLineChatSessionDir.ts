import { mkdir } from "node:fs/promises";
import path from "node:path";

/**
 * Returns the dedicated md-editor session directory next to normal project sessions.
 */
export async function getLineChatSessionDir(sessionDir: string): Promise<string> {
	const dir = path.join(path.dirname(sessionDir), "md-editor-line-chats", path.basename(sessionDir));
	await mkdir(dir, { recursive: true });
	return dir;
}
