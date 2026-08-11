import type { WebFetchResult } from "./webFetchTypes";

/**
 * Fetches a URL via Jina Reader API as a fallback.
 *
 * @param url The URL to fetch.
 * @param jinaApiKey Optional Jina API key.
 * @param signal Optional AbortSignal.
 * @returns Fetch result or null if Jina fails.
 */
export async function executeJinaFetch(
	url: string,
	jinaApiKey?: string,
	signal?: AbortSignal,
): Promise<WebFetchResult | null> {
	const jinaUrl = `https://r.jina.ai/${encodeURIComponent(url)}`;

	try {
		const fetchSignal = signal ?? AbortSignal.timeout(15000);
		const headers: Record<string, string> = {};
		if (jinaApiKey) {
			headers["X-Api-Key"] = jinaApiKey;
		}

		const response = await fetch(jinaUrl, {
			headers,
			signal: fetchSignal,
		});

		if (!response.ok) {
			return null;
		}

		const content = await response.text();
		if (!content || content.trim().length === 0) {
			return null;
		}

		return {
			title: `${url} (Jina Reader)`,
			output: content,
			mime: "text/markdown",
			contentType: "text/markdown",
		};
	} catch {
		return null;
	}
}
