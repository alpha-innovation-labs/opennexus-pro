/**
 * Extracts Twitter/X status URLs from user text.
 *
 * @param text User prompt text.
 * @returns Unique tweet URLs in source order.
 */
export function extractTweetUrls(text: string): string[] {
	const matches = text.matchAll(/https?:\/\/(?:www\.)?(?:twitter\.com|x\.com)\/[^\s/]+\/status\/\d+(?:\?[^\s]*)?/gi);
	return [...new Set([...matches].map((match) => match[0]))];
}
