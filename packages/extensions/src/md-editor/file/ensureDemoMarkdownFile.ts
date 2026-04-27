import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

/**
 * Ensures the hardcoded demo Markdown file exists and returns its canonical path.
 */
export async function ensureDemoMarkdownFile(cwd: string): Promise<string> {
	const filePath = path.resolve(cwd, "demo.md");
	await mkdir(path.dirname(filePath), { recursive: true });
	try {
		await writeFile(filePath, "", { flag: "wx" });
	} catch (error) {
		if ((error as NodeJS.ErrnoException).code !== "EEXIST") throw error;
	}
	return filePath;
}
