import { fetchJson } from "../../shared/fetchJson.js";
import { formatResetTime } from "../../shared/formatResetTime.js";
import { clampPercent } from "../../shared/clampPercent.js";
import type { UsageSnapshot } from "../../types.js";
import { getAntigravityAuth } from "./getAntigravityAuth.js";

/**
 * Fetches Antigravity model quota usage.
 *
 * @returns Antigravity usage snapshot.
 */
export async function fetchAntigravityUsage(): Promise<UsageSnapshot> {
	const auth = getAntigravityAuth();
	if (!auth.token) return { provider: "antigravity", windows: [], fetchedAt: Date.now(), error: "no-auth" };
	let lastError = "fetch-failed";
	for (const endpoint of ["https://daily-cloudcode-pa.sandbox.googleapis.com/v1internal:fetchAvailableModels", "https://cloudcode-pa.googleapis.com/v1internal:fetchAvailableModels"]) {
		const result = await fetchJson(endpoint, {
			method: "POST",
			headers: {
				Authorization: `Bearer ${auth.token}`,
				"Content-Type": "application/json",
				"User-Agent": "antigravity/1.11.5 darwin/arm64",
				"X-Goog-Api-Client": "google-cloud-sdk vscode_cloudshelleditor/0.1",
				"Client-Metadata": JSON.stringify({
					ideType: "IDE_UNSPECIFIED",
					platform: "PLATFORM_UNSPECIFIED",
					pluginType: "GEMINI",
				}),
			},
			body: JSON.stringify(auth.projectId ? { project: auth.projectId } : {}),
		});
		if (!result.ok) {
			lastError = result.error;
			continue;
		}
		const data = result.data as {
			models?: Record<string, {
				displayName?: string;
				isInternal?: boolean;
				quotaInfo?: { remainingFraction?: number; resetTime?: string };
			}>;
		};
		const windows = Object.entries(data.models ?? {})
			.filter(([modelId, model]) => !model.isInternal && modelId.toLowerCase() !== "tab_flash_lite_preview")
			.map(([modelId, model]) => ({
				label: model.displayName ?? modelId,
				usedPercent: clampPercent((1 - (typeof model.quotaInfo?.remainingFraction === "number" ? model.quotaInfo.remainingFraction : 1)) * 100),
				resetAt: model.quotaInfo?.resetTime,
				resetDescription: model.quotaInfo?.resetTime ? formatResetTime(model.quotaInfo.resetTime) : undefined,
			}))
			.sort((left, right) => left.label.localeCompare(right.label));
		return { provider: "antigravity", windows, fetchedAt: Date.now() };
	}
	return { provider: "antigravity", windows: [], fetchedAt: Date.now(), error: lastError };
}
