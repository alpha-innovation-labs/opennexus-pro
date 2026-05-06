import type { TweetReferenceInput } from "../types/TweetReferenceInput.js";
import { writeTweetReference } from "./writeTweetReference.js";

/**
 * Writes several tweet memories before a single operation commit.
 *
 * @param root Memory root directory.
 * @param inputs Tweet reference inputs.
 * @returns Written file paths.
 */
export async function writeTweetReferences(root: string, inputs: TweetReferenceInput[]): Promise<Array<{ referencePath: string; topicPath: string }>> {
	const written: Array<{ referencePath: string; topicPath: string }> = [];
	for (const input of inputs) written.push(await writeTweetReference(root, input));
	return written;
}
