import type { TweetReferenceInput } from "../types/TweetReferenceInput.js";
import { formatSingleLineDistillation } from "./formatSingleLineDistillation.js";

/**
 * Formats a single topic entry linked to a raw reference file.
 *
 * @param referenceName Raw reference file name.
 * @param input Tweet reference input.
 * @returns One-line topic entry.
 */
export function formatTopicEntry(referenceName: string, input: TweetReferenceInput): string {
	return `- ${referenceName}: ${formatSingleLineDistillation(input.distilledMarkdown)}`;
}
