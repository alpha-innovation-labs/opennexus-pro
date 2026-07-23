import { getUsageGauge } from "./getUsageGauge.js";

/**
 * Formats one usage slot with its gauge icon.
 *
 * @param value Used percentage.
 * @returns Formatted usage slot.
 */
export function formatUsageSlot(value: number | undefined): string {
	if (typeof value !== "number") return "○ --";
	return `${getUsageGauge(value)} ${value}%`;
}
