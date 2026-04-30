import type { TweetReferenceInput } from "../types/TweetReferenceInput.js";
import { formatSingleLineDistillation } from "./formatSingleLineDistillation.js";

/**
 * Formats the distilled tweet reference markdown file.
 *
 * @param input Tweet reference input.
 * @returns Markdown distilled note.
 */
export function formatDistilledTweetReference(input: TweetReferenceInput): string {
	const keywords = (input.keywords ?? []).map((keyword) => `  - ${keyword}`).join("\n") || "  - tweet";
	return `---\ntitle: ${input.title}\nversion: tweet\nupdated: ${input.updated}\nsource: ${input.tweetUrl}\nkeywords:\n${keywords}\n---\n\n## Overview\n\nThis is a distilled tweet reference stored for Nexus memory retrieval.\n\n## Distilled information\n\n${formatSingleLineDistillation(input.distilledMarkdown)}\n`;
}
