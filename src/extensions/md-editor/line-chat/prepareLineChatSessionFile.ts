import { readFile, rename } from "node:fs/promises";

/**
 * Archives legacy placeholder JSONL sessions that are not valid Pi assistant transcripts.
 */
export async function prepareLineChatSessionFile(sessionPath: string): Promise<void> {
	try {
		const content = await readFile(sessionPath, "utf8");
		const invalid = content.includes("You are the right-panel md-editor chat inside Nexus.") || content.split(/\r?\n/).filter(Boolean).some((line) => {
			try {
				const entry = JSON.parse(line) as { type?: string; message?: { role?: string; usage?: unknown } };
				return entry.type === "message" && entry.message?.role === "assistant" && !entry.message.usage;
			} catch {
				return true;
			}
		});
		if (invalid) await rename(sessionPath, `${sessionPath}.legacy-placeholder`);
	} catch (error) {
		if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
	}
}
