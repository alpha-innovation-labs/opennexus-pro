import { fetchJson } from "../../shared/fetchJson.js";
import { formatDuration } from "../../shared/formatDuration.js";
import { clampPercent } from "../../shared/clampPercent.js";
import type { RateWindow, UsageSnapshot } from "../../types.js";
import { getCodexCredentials } from "./getCodexCredentials.js";

/**
 * Fetches Codex subscription usage.
 *
 * @returns Codex usage snapshot.
 */
export async function fetchCodexUsage(): Promise<UsageSnapshot> {
	const credentials = getCodexCredentials();
	if (!credentials.token) return { provider: "codex", windows: [], fetchedAt: Date.now(), error: "no-auth" };
	const headers: Record<string, string> = {
		Authorization: `Bearer ${credentials.token}`,
		Accept: "application/json",
	};
	if (credentials.accountId) headers["ChatGPT-Account-Id"] = credentials.accountId;
	const result = await fetchJson("https://chatgpt.com/backend-api/wham/usage", { headers });
	if (!result.ok) return { provider: "codex", windows: [], fetchedAt: Date.now(), error: result.error };
	const data = result.data as {
		rate_limit?: { primary_window?: Record<string, unknown>; secondary_window?: Record<string, unknown> };
		additional_rate_limits?: Array<{ limit_name?: string; metered_feature?: string; rate_limit?: { primary_window?: Record<string, unknown>; secondary_window?: Record<string, unknown> } }>;
	};
	const windows: RateWindow[] = [];
	for (const entry of [
		{ prefix: undefined, rateLimit: data.rate_limit },
		...((data.additional_rate_limits ?? []).map((item) => ({
			prefix: item.limit_name?.trim() || item.metered_feature?.trim() || "Additional",
			rateLimit: item.rate_limit,
		}))),
	]) {
		for (const [kind, fallbackSeconds] of [["primary_window", 18_000], ["secondary_window", 604_800]] as const) {
			const window = entry.rateLimit?.[kind] as Record<string, unknown> | undefined;
			if (!window) continue;
			const seconds = typeof window.limit_window_seconds === "number" ? window.limit_window_seconds : fallbackSeconds;
			if (!Number.isFinite(seconds) || seconds <= 0) continue;
			const hours = Math.round(seconds / 3_600);
			const labelBase = hours >= 144 ? "Week" : hours >= 24 ? "Day" : `${hours}h`;
			const label = entry.prefix ? `${entry.prefix} ${labelBase}` : labelBase;
			windows.push({
				label,
				usedPercent: clampPercent(typeof window.used_percent === "number" ? window.used_percent : 0),
				resetAt: typeof window.reset_at === "number" ? new Date(window.reset_at * 1000).toISOString() : undefined,
				resetDescription: typeof window.reset_after_seconds === "number" ? formatDuration(window.reset_after_seconds) : undefined,
			});
		}
	}
	return { provider: "codex", windows, fetchedAt: Date.now() };
}
