import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

/**
 * Ensures the hidden automation editor chat session file exists.
 *
 * @param sessionPath Hidden session path.
 */
export async function prepareAutomationChatSessionFile(sessionPath: string): Promise<void> {
	await mkdir(dirname(sessionPath), { recursive: true });
	await writeFile(sessionPath, "", { flag: "a" });
}
