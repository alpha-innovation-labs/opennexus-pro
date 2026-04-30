import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { TweetReferenceInput } from "../types/TweetReferenceInput.js";
import { formatSingleLineDistillation } from "./formatSingleLineDistillation.js";

/**
 * Adds or replaces one line in the reference index file.
 *
 * @param referenceDir Reference directory containing raw and distilled files.
 * @param fileName Distilled reference file name.
 * @param input Tweet reference input.
 */
export async function upsertReferenceIndexEntry(referenceDir: string, fileName: string, input: TweetReferenceInput): Promise<void> {
	const indexPath = join(referenceDir, "references.md");
	const existing = await readExistingReferenceLines(indexPath);
	const nextLine = `- ${fileName}: ${formatSingleLineDistillation(input.distilledMarkdown)}`;
	const lines = [...existing.filter((line) => !line.startsWith(`- ${fileName}:`)), nextLine].sort();
	await writeFile(indexPath, `---\ntitle: References\nupdated: ${input.updated}\n---\n\n## References\n\n${lines.join("\n")}\n`, "utf8");
}

/** Reads current reference bullet lines from an index. */
async function readExistingReferenceLines(indexPath: string): Promise<string[]> {
	try {
		return (await readFile(indexPath, "utf8")).split(/\r?\n/).filter((line) => line.startsWith("- "));
	} catch (error) {
		if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
		throw error;
	}
}
