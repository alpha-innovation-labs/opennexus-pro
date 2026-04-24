import { clampPercent } from "../shared/clampPercent.js";
import { windowMatchesModel } from "../shared/windowMatchesModel.js";
import type { ProviderModel, UsagePair, UsageSnapshot } from "../types.js";

/**
 * Selects the two usage percentages rendered as daily and weekly slots.
 *
 * @param snapshot Provider usage snapshot.
 * @param model Active model metadata.
 * @returns Used-usage pair for the widget.
 */
export function selectUsagePair(snapshot: UsageSnapshot | undefined, model: ProviderModel): UsagePair | undefined {
	if (!snapshot) return undefined;
	const byLabel = (label: string) => snapshot.windows.find((window) => window.label === label);
	const used = (label: string | undefined) => {
		if (!label) return undefined;
		const window = snapshot.windows.find((item) => item.label === label);
		return window ? clampPercent(window.usedPercent) : undefined;
	};
	const modelId = model?.id;
	if (snapshot.provider === "anthropic") return { provider: snapshot.provider, daily: used("5h"), weekly: used("Week") };
	if (snapshot.provider === "copilot") return { provider: snapshot.provider, daily: used("Month"), weekly: used("Chat") };
	if (snapshot.provider === "gemini") {
		const dailyLabel = modelId?.toLowerCase().includes("flash") ? "Flash" : byLabel("Pro") ? "Pro" : byLabel("Flash") ? "Flash" : snapshot.windows[0]?.label;
		const weeklyLabel = dailyLabel === "Flash" ? (byLabel("Pro") ? "Pro" : undefined) : byLabel("Flash") ? "Flash" : undefined;
		return { provider: snapshot.provider, daily: used(dailyLabel), weekly: used(weeklyLabel) };
	}
	if (snapshot.provider === "antigravity") {
		const matched = snapshot.windows.find((window) => windowMatchesModel(window.label, modelId)) ?? snapshot.windows[0];
		return { provider: snapshot.provider, daily: matched ? clampPercent(matched.usedPercent) : undefined, weekly: undefined };
	}
	if (snapshot.provider === "codex") {
		const matchedWindows = snapshot.windows.filter((window) => windowMatchesModel(window.label, modelId));
		const windows = matchedWindows.length > 0 ? matchedWindows : snapshot.windows.filter((window) => !window.label.toLowerCase().includes("spark"));
		const dailyWindow = windows.find((window) => /\b\d+h\b/i.test(window.label)) ?? windows[0];
		const weeklyWindow = windows.find((window) => /\b(day|week)\b/i.test(window.label));
		return {
			provider: snapshot.provider,
			daily: dailyWindow ? clampPercent(dailyWindow.usedPercent) : undefined,
			weekly: weeklyWindow ? clampPercent(weeklyWindow.usedPercent) : undefined,
		};
	}
	if (snapshot.provider === "kiro") return { provider: snapshot.provider, daily: used("Credits"), weekly: undefined };
	if (snapshot.provider === "zai") return { provider: snapshot.provider, daily: used("Tokens") ?? used(snapshot.windows[0]?.label), weekly: used("Monthly") };
	return undefined;
}
