import { readFile } from "node:fs/promises";
import { computeMarkdownFileSnapshot, type MarkdownFileSnapshot } from "./computeMarkdownFileSnapshot.js";
import { ensureDemoMarkdownFile } from "./ensureDemoMarkdownFile.js";

/**
 * Creates demo.md when missing and returns its current Markdown snapshot.
 */
export async function loadDemoMarkdownFile(input: { cwd: string }): Promise<MarkdownFileSnapshot> {
	const filePath = await ensureDemoMarkdownFile(input.cwd);
	const content = await readFile(filePath, "utf8");
	return computeMarkdownFileSnapshot(filePath, content);
}
