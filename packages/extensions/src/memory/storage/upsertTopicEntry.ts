import { readFile, writeFile } from "node:fs/promises";
import type { TweetReferenceInput } from "../types/TweetReferenceInput.js";
import { formatTopicEntry } from "./formatTopicEntry.js";

/**
 * Adds or replaces one reference-backed line in a topic file.
 *
 * @param topicPath Topic markdown path.
 * @param referenceName Raw reference file name.
 * @param input Tweet reference input.
 */
export async function upsertTopicEntry(topicPath: string, referenceName: string, input: TweetReferenceInput): Promise<void> {
	const currentLines = await readTopicLines(topicPath);
	const nextLine = formatTopicEntry(referenceName, input);
	const lines = [...currentLines.filter((line) => !line.startsWith(`- ${referenceName}:`)), nextLine];
	await writeFile(topicPath, `---\ntitle: ${input.topicName}\nupdated: ${input.updated}\n---\n\n${lines.join("\n")}\n`, "utf8");
}

/** Reads existing topic bullet lines. */
async function readTopicLines(topicPath: string): Promise<string[]> {
	try {
		return (await readFile(topicPath, "utf8")).split(/\r?\n/).filter((line) => line.startsWith("- "));
	} catch (error) {
		if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
		throw error;
	}
}
