/**
 * Fetches JSON with a timeout and returns a structured result.
 *
 * @param url Request URL.
 * @param init Request init.
 * @param timeoutMs Timeout in milliseconds.
 * @returns Request result payload.
 */
export async function fetchJson(url: string, init: RequestInit, timeoutMs = 10_000): Promise<{ ok: true; data: unknown } | { ok: false; error: string }> {
	const controller = new AbortController();
	const timer = setTimeout(() => controller.abort(), timeoutMs);
	try {
		const response = await fetch(url, { ...init, signal: controller.signal });
		if (!response.ok) return { ok: false, error: `HTTP ${response.status}` };
		return { ok: true, data: await response.json() };
	} catch (error) {
		return { ok: false, error: error instanceof Error ? error.message : String(error) };
	} finally {
		clearTimeout(timer);
	}
}
