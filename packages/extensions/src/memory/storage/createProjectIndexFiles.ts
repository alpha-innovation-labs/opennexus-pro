import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import type { TweetReferenceInput } from "../types/TweetReferenceInput.js";
import { slugifyMemoryName } from "../path/slugifyMemoryName.js";

/**
 * Creates missing app/package index files required by the Projects structure.
 *
 * @param root Memory root directory.
 * @param input Tweet reference input.
 */
export async function createProjectIndexFiles(root: string, input: TweetReferenceInput): Promise<void> {
	const projectSlug = slugifyMemoryName(input.projectName);
	const projectFile = join(root, projectSlug, `${projectSlug}.md`);
	const name = input.kind === "app" ? slugifyMemoryName(input.appName ?? "inbox") : slugifyMemoryName(input.packageName ?? "inbox");
	const file = input.kind === "app" ? join(root, projectSlug, "apps", name, `${name}.md`) : join(root, projectSlug, "packages", slugifyMemoryName(input.packageGroup ?? "general"), name, `${name}.md`);
	await mkdir(dirname(projectFile), { recursive: true });
	await writeFile(projectFile, formatProjectIndex(input), { flag: "wx" }).catch(ignoreExistingFile);
	await mkdir(dirname(file), { recursive: true });
	await writeFile(file, `---\ntitle: ${name}\nupdated: ${input.updated}\n---\n\n## Overview\n\nMemory project component index.\n`, { flag: "wx" }).catch(ignoreExistingFile);
}

/** Formats a Projects-compatible project root document. */
function formatProjectIndex(input: TweetReferenceInput): string {
	const description = input.projectDescription?.trim() || `Knowledge project for ${input.projectName}.`;
	return `${description}\n\n## Overview\n\n${description}\n\n## Apps\n\n## Packages\n\n## Recipes\n`;
}

/** Ignores existing-file write failures. */
function ignoreExistingFile(error: NodeJS.ErrnoException): void {
	if (error.code !== "EEXIST") throw error;
}
