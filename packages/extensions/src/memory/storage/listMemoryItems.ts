import { readFile } from "node:fs/promises";
import { relative } from "node:path";
import type { MemoryItem } from "../types/MemoryItem.js";
import { listMarkdownFiles } from "./listMarkdownFiles.js";

/**
 * Loads browsable markdown memory items from the memory root.
 *
 * @param root Memory root directory.
 * @returns Memory items sorted by relative path.
 */
export async function listMemoryItems(root: string): Promise<MemoryItem[]> {
	const files = await listMarkdownFiles(root);
	return Promise.all(files.map(async (path) => {
		const relativePath = relative(root, path);
		return { label: relativePath.replace(/\.md$/, ""), path, relativePath, content: await readFile(path, "utf8") };
	}));
}
