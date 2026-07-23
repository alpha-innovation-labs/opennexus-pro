import { fetchJson } from "../../shared/fetchJson.js";
import { formatResetTime } from "../../shared/formatResetTime.js";
import { clampPercent } from "../../shared/clampPercent.js";
import type { UsageSnapshot } from "../../types.js";
import { getCopilotToken } from "./getCopilotToken.js";

/**
 * Fetches Copilot subscription usage.
 *
 * @returns Copilot usage snapshot.
 */
export async function fetchCopilotUsage(): Promise<UsageSnapshot> {
	const token = getCopilotToken();
	if (!token) return { provider: "copilot", windows: [], fetchedAt: Date.now(), error: "no-auth" };
	const result = await fetchJson("https://api.github.com/copilot_internal/user", {
		headers: {
			"Editor-Version": "vscode/1.96.2",
			"User-Agent": "GitHubCopilotChat/0.26.7",
			"X-Github-Api-Version": "2025-04-01",
			Accept: "application/json",
			Authorization: `token ${token}`,
		},
	});
	if (!result.ok) return { provider: "copilot", windows: [], fetchedAt: Date.now(), error: result.error };
	const data = result.data as {
		quota_reset_date_utc?: string;
		quota_snapshots?: {
			premium_interactions?: { percent_remaining?: number };
			chat?: { percent_remaining?: number; unlimited?: boolean };
		};
	};
	const resetDescription = data.quota_reset_date_utc ? formatResetTime(data.quota_reset_date_utc) : undefined;
	return {
		provider: "copilot",
		fetchedAt: Date.now(),
		windows: [
			...(typeof data.quota_snapshots?.premium_interactions?.percent_remaining === "number" ? [{
				label: "Month",
				usedPercent: clampPercent(100 - data.quota_snapshots.premium_interactions.percent_remaining),
				resetAt: data.quota_reset_date_utc,
				resetDescription,
			}] : []),
			...(typeof data.quota_snapshots?.chat?.percent_remaining === "number" && !data.quota_snapshots.chat.unlimited ? [{
				label: "Chat",
				usedPercent: clampPercent(100 - data.quota_snapshots.chat.percent_remaining),
				resetAt: data.quota_reset_date_utc,
				resetDescription,
			}] : []),
		],
	};
}
