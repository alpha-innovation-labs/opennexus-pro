import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { TweetReferenceInput } from "../types/TweetReferenceInput.js";
import { slugifyMemoryName } from "../path/slugifyMemoryName.js";
import { createProjectIndexFiles } from "./createProjectIndexFiles.js";
import { formatDistilledTweetReference } from "./formatDistilledTweetReference.js";
import { formatRawTweetReference } from "./formatRawTweetReference.js";
import { resolveReferenceDirectory } from "./resolveReferenceDirectory.js";
import { upsertReferenceIndexEntry } from "./upsertReferenceIndexEntry.js";

/**
 * Writes raw and distilled tweet reference files into the memory tree.
 *
 * @param root Memory root directory.
 * @param input Tweet reference input.
 * @returns Written file paths.
 */
export async function writeTweetReference(root: string, input: TweetReferenceInput): Promise<{ rawPath: string; distilledPath: string }> {
	await createProjectIndexFiles(root, input);
	const referenceDir = resolveReferenceDirectory(root, input);
	const slug = slugifyMemoryName(input.title || input.tweetUrl);
	const rawPath = join(referenceDir, "raw", `${slug}.md`);
	const distilledFileName = `${slug}-distilled.md`;
	const distilledPath = join(referenceDir, distilledFileName);
	await mkdir(join(referenceDir, "raw"), { recursive: true });
	await writeFile(rawPath, formatRawTweetReference(input), "utf8");
	await writeFile(distilledPath, formatDistilledTweetReference(input), "utf8");
	await upsertReferenceIndexEntry(referenceDir, distilledFileName, input);
	return { rawPath, distilledPath };
}
