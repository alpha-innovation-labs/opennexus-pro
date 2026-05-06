import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { slugifyMemoryName } from "../path/slugifyMemoryName.js";

/**
 * Reads one raw reference by project and reference name.
 *
 * @param root Memory root directory.
 * @param projectName Confirmed project name or slug.
 * @param referenceName Reference markdown file name or title.
 * @returns Raw reference markdown.
 */
export async function readMemoryReference(root: string, projectName: string, referenceName: string): Promise<string> {
	const fileName = referenceName.endsWith(".md") ? referenceName : `${slugifyMemoryName(referenceName)}.md`;
	return readFile(join(root, slugifyMemoryName(projectName), "references", fileName), "utf8");
}
