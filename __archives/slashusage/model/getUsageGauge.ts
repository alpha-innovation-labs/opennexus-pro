import { clampPercent } from "../shared/clampPercent.js";

/**
 * Maps a used percentage to a compact gauge icon.
 *
 * @param value Used percentage.
 * @returns Gauge icon.
 */
export function getUsageGauge(value: number | undefined): string {
	const percent = clampPercent(typeof value === "number" ? value : 0);
	if (percent >= 80) return "●";
	if (percent >= 60) return "◕";
	if (percent >= 40) return "◑";
	if (percent >= 20) return "◔";
	return "○";
}
