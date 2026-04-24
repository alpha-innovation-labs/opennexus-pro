import { fetchJson } from "../../shared/fetchJson.js";
import { formatResetTime } from "../../shared/formatResetTime.js";
import { normalizeUsedPercent } from "../../shared/normalizeUsedPercent.js";
import type { UsageSnapshot } from "../../types.js";
import { getAnthropicToken } from "./getAnthropicToken.js";

/**
 * Fetches Claude subscription usage.
 *
 * @returns Claude usage snapshot.
 */
export async function fetchAnthropicUsage(): Promise<UsageSnapshot> {
	const token = getAnthropicToken();
	if (!token) return { provider: "anthropic", windows: [], fetchedAt: Date.now(), error: "no-auth" };
	const result = await fetchJson("https://api.anthropic.com/api/oauth/usage", {
		headers: {
			Authorization: `Bearer ${token}`,
			"anthropic-beta": "oauth-2025-04-20",
		},
	});
	if (!result.ok) return { provider: "anthropic", windows: [], fetchedAt: Date.now(), error: result.error };
	const data = result.data as {
		five_hour?: { utilization?: number; resets_at?: string };
		seven_day?: { utilization?: number; resets_at?: string };
	};
	return {
		provider: "anthropic",
		fetchedAt: Date.now(),
		windows: [
			...(data.five_hour?.utilization === undefined ? [] : [{
				label: "5h",
				usedPercent: normalizeUsedPercent(data.five_hour.utilization),
				resetAt: data.five_hour.resets_at,
				resetDescription: data.five_hour.resets_at ? formatResetTime(data.five_hour.resets_at) : undefined,
			}]),
			...(data.seven_day?.utilization === undefined ? [] : [{
				label: "Week",
				usedPercent: normalizeUsedPercent(data.seven_day.utilization),
				resetAt: data.seven_day.resets_at,
				resetDescription: data.seven_day.resets_at ? formatResetTime(data.seven_day.resets_at) : undefined,
			}]),
		],
	};
}
