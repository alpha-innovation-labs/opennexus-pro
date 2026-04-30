import { readdir } from "node:fs/promises";
import { join } from "node:path";
import type { MemoryProject } from "../types/MemoryProject.js";

/**
 * Lists project roots in the Nexus memory directory.
 *
 * @param root Memory root directory.
 * @returns Existing memory projects.
 */
export async function listMemoryProjects(root: string): Promise<MemoryProject[]> {
	try {
		const entries = await readdir(root, { withFileTypes: true });
		return entries.filter((entry) => entry.isDirectory()).map((entry) => ({ name: entry.name, slug: entry.name, path: join(root, entry.name) })).sort((a, b) => a.slug.localeCompare(b.slug));
	} catch (error) {
		if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
		throw error;
	}
}
