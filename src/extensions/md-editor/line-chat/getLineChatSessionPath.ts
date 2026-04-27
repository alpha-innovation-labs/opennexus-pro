import path from "node:path";
import { createLineChatKey } from "./createLineChatKey.js";
import { getLineChatSessionDir } from "./getLineChatSessionDir.js";

/**
 * Returns the hidden Pi JSONL session path for one md-editor line chat.
 */
export async function getLineChatSessionPath(sessionDir: string, filePath: string, lineNumber: number): Promise<string> {
	const dir = await getLineChatSessionDir(sessionDir);
	return path.join(dir, `${createLineChatKey(filePath, lineNumber)}.jsonl`);
}
