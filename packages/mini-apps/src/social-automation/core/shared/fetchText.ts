/**
 * Fetches text with a bounded timeout and clear HTTP errors.
 *
 * @param url Target URL.
 * @param timeoutMs Request timeout in milliseconds.
 * @returns Response body text.
 */
export async function fetchText(url: string, timeoutMs = 20_000): Promise<string> {
	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), timeoutMs);
	try {
		const response = await fetch(url, {
			headers: { "User-Agent": "NexusSocialAutomation/1.0" },
			signal: controller.signal,
		});
		if (!response.ok) throw new Error(`HTTP ${response.status} for ${url}`);
		return await response.text();
	} finally {
		clearTimeout(timeout);
	}
}
