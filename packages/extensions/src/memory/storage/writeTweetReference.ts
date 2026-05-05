import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { TweetReferenceInput } from "../types/TweetReferenceInput.js";
import { slugifyMemoryName } from "../path/slugifyMemoryName.js";
import { formatRawTweetReference } from "./formatRawTweetReference.js";
import { upsertTopicEntry } from "./upsertTopicEntry.js";

/**
 * Writes a raw tweet reference and one-line topic entry.
 *
 * @param root Memory root directory.
 * @param input Tweet reference input.
 * @returns Written file paths.
 */
export async function writeTweetReference(root: string, input: TweetReferenceInput): Promise<{ referencePath: string; topicPath: string }> {
	const projectRoot = join(root, slugifyMemoryName(input.projectName));
	const referencesDir = join(projectRoot, "references");
	const referenceName = `${slugifyMemoryName(input.title || input.tweetUrl)}.md`;
	const referencePath = join(referencesDir, referenceName);
	const topicPath = join(projectRoot, `${slugifyMemoryName(input.topicName)}.md`);
	await mkdir(referencesDir, { recursive: true });
	await writeFile(referencePath, formatRawTweetReference(input), "utf8");
	await upsertTopicEntry(topicPath, referenceName, input);
	return { referencePath, topicPath };
}
