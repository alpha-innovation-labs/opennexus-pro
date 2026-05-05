import type { TweetReferenceInput } from "../types/TweetReferenceInput.js";

/**
 * Formats the raw tweet reference markdown file.
 *
 * @param input Tweet reference input.
 * @returns Markdown source content.
 */
export function formatRawTweetReference(input: TweetReferenceInput): string {
	return `---\ntitle: ${input.title}\nversion: tweet\nupdated: ${input.updated}\nsource: ${input.tweetUrl}\ntopic: ${input.topicName}\npurpose: Raw tweet capture for Nexus memory.\n---\n\n## Source Capture\n\n${input.rawMarkdown.trim()}\n`;
}
