import { fetchJson } from "../../shared/fetchJson.js";
import { formatResetTime } from "../../shared/formatResetTime.js";
import { normalizeUsedPercent } from "../../shared/normalizeUsedPercent.js";
import type { UsageSnapshot } from "../../types.js";
import { getZaiApiKey } from "./getZaiApiKey.js";

/**
 * Fetches z.ai quota usage.
 *
 * @returns z.ai usage snapshot.
 */
export async function fetchZaiUsage(): Promise<UsageSnapshot> {
	const apiKey = getZaiApiKey();
	if (!apiKey) return { provider: "zai", windows: [], fetchedAt: Date.now(), error: "no-auth" };
	const result = await fetchJson("https://api.z.ai/api/monitor/usage/quota/limit", {
		method: "GET",
		headers: {
			Authorization: `Bearer ${apiKey}`,
			Accept: "application/json",
		},
	});
	if (!result.ok) return { provider: "zai", windows: [], fetchedAt: Date.now(), error: result.error };
	const data = result.data as {
		success?: boolean;
		code?: number;
		msg?: string;
		data?: { limits?: Array<{ type?: string; percentage?: number; nextResetTime?: string }> };
	};
	if (!data.success || data.code !== 200) return { provider: "zai", windows: [], fetchedAt: Date.now(), error: data.msg || "api-error" };
	return {
		provider: "zai",
		fetchedAt: Date.now(),
		windows: (data.data?.limits ?? []).flatMap((limit) => {
			const label = limit.type === "TOKENS_LIMIT" ? "Tokens" : limit.type === "TIME_LIMIT" ? "Monthly" : undefined;
			return label ? [{
				label,
				usedPercent: normalizeUsedPercent(limit.percentage ?? 0),
				resetAt: limit.nextResetTime,
				resetDescription: limit.nextResetTime ? formatResetTime(limit.nextResetTime) : undefined,
			}] : [];
		}),
	};
}
