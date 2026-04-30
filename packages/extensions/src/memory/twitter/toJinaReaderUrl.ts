/**
 * Builds a Jina Reader URL for a tweet URL.
 *
 * @param tweetUrl Original Twitter/X URL.
 * @returns Jina Reader URL.
 */
export function toJinaReaderUrl(tweetUrl: string): string {
	return `https://r.jina.ai/http://${tweetUrl.replace(/^https?:\/\//, "")}`;
}
