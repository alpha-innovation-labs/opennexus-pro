import type { WebFetchResult } from "./webFetchTypes";

/**
 * Strips control characters that break JSON parsing.
 */
function stripControlChars(text: string): string {
	return text
		.split("")
		.filter((c) => {
			const code = c.charCodeAt(0);
			return !(
				code === 0 ||
				(code >= 1 && code <= 8) ||
				code === 11 ||
				code === 12 ||
				(code >= 14 && code <= 31)
			);
		})
		.join("");
}

/**
 * Fetches a URL via Crawl4AI and extracts markdown content.
 *
 * @param url The URL to fetch.
 * @param crawl4aiUrl Crawl4AI server base URL (e.g. http://100.106.251.92:11235).
 * @param signal Optional AbortSignal.
 * @returns Fetch result or null if Crawl4AI fails.
 */
export async function executeCrawl4AIFetch(
	url: string,
	crawl4aiUrl: string,
	signal?: AbortSignal,
): Promise<WebFetchResult | null> {
	const baseUrl = crawl4aiUrl.replace(/\/+$/, "");
	const apiUrl = `${baseUrl}/crawl`;

	try {
		const fetchSignal = signal ?? AbortSignal.timeout(30000);
		const response = await fetch(apiUrl, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				urls: [url],
				cache_mode: "bypass",
				word_count_threshold: 20,
				only_text: true,
			}),
			signal: fetchSignal,
		});

		if (!response.ok) {
			return null;
		}

		const rawText = await response.text();
		const cleaned = stripControlChars(rawText);

		let data: unknown;
		try {
			data = JSON.parse(cleaned);
		} catch {
			return null;
		}

		if (!data || typeof data !== "object") return null;
		const obj = data as Record<string, unknown>;

		if (!obj.success) return null;

		const results = obj.results;
		if (!Array.isArray(results) || results.length === 0) return null;

		const firstResult = results[0] as Record<string, unknown>;
		if (!firstResult.success) return null;

		const markdown = firstResult.markdown as
			| Record<string, unknown>
			| undefined;
		const content =
			typeof markdown?.raw_markdown === "string"
				? markdown.raw_markdown
				: String(firstResult.html ?? "");

		const title = String(firstResult.title ?? url);

		return {
			title: `${title} (Crawl4AI)`,
			output: content,
			mime: "text/markdown",
			contentType: "text/markdown",
		};
	} catch {
		return null;
	}
}
