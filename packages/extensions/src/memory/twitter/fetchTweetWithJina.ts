import { toJinaReaderUrl } from "./toJinaReaderUrl.js";

/**
 * Reads a tweet through Jina Reader and returns markdown text.
 *
 * @param tweetUrl Twitter/X status URL.
 * @param signal Optional cancellation signal.
 * @returns Jina Reader markdown response.
 */
export async function fetchTweetWithJina(tweetUrl: string, signal?: AbortSignal): Promise<string> {
	const response = await fetch(toJinaReaderUrl(tweetUrl), { signal });
	if (!response.ok) throw new Error(`Jina Reader failed with HTTP ${response.status}`);
	return response.text();
}
