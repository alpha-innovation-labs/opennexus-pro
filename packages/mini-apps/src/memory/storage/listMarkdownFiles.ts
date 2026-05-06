import { readdir } from "node:fs/promises";
import { join } from "node:path";

/**
 * Recursively lists markdown files under a directory.
 *
 * @param root Directory to scan.
 * @returns Absolute markdown file paths.
 */
export async function listMarkdownFiles(root: string): Promise<string[]> {
	try {
		const entries = await readdir(root, { withFileTypes: true });
		const nested = await Promise.all(entries.map((entry) => {
			const path = join(root, entry.name);
			if (entry.isDirectory()) return listMarkdownFiles(path);
			return entry.isFile() && entry.name.endsWith(".md") ? [path] : [];
		}));
		return nested.flat().sort();
	} catch (error) {
		if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
		throw error;
	}
}
