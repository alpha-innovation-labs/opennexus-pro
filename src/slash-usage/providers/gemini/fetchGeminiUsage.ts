import { fetchJson } from "../../shared/fetchJson.js";
import { clampPercent } from "../../shared/clampPercent.js";
import type { UsageSnapshot } from "../../types.js";
import { getGeminiToken } from "./getGeminiToken.js";

/**
 * Fetches Gemini quota usage.
 *
 * @returns Gemini usage snapshot.
 */
export async function fetchGeminiUsage(): Promise<UsageSnapshot> {
	const token = getGeminiToken();
	if (!token) return { provider: "gemini", windows: [], fetchedAt: Date.now(), error: "no-auth" };
	const result = await fetchJson("https://cloudcode-pa.googleapis.com/v1internal:retrieveUserQuota", {
		method: "POST",
		headers: {
			Authorization: `Bearer ${token}`,
			"Content-Type": "application/json",
		},
		body: "{}",
	});
	if (!result.ok) return { provider: "gemini", windows: [], fetchedAt: Date.now(), error: result.error };
	const data = result.data as { buckets?: Array<{ modelId?: string; remainingFraction?: number }> };
	let proMin = 1;
	let flashMin = 1;
	let hasPro = false;
	let hasFlash = false;
	for (const bucket of data.buckets ?? []) {
		const modelId = bucket.modelId?.toLowerCase() ?? "";
		const remaining = typeof bucket.remainingFraction === "number" ? bucket.remainingFraction : 1;
		if (modelId.includes("pro")) {
			hasPro = true;
			proMin = Math.min(proMin, remaining);
		}
		if (modelId.includes("flash")) {
			hasFlash = true;
			flashMin = Math.min(flashMin, remaining);
		}
	}
	return {
		provider: "gemini",
		fetchedAt: Date.now(),
		windows: [
			...(hasPro ? [{ label: "Pro", usedPercent: clampPercent((1 - proMin) * 100) }] : []),
			...(hasFlash ? [{ label: "Flash", usedPercent: clampPercent((1 - flashMin) * 100) }] : []),
		],
	};
}
