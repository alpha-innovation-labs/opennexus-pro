import { clampPercent } from "./clampPercent.js";

/**
 * Normalizes 0-1 fractions and 0-100 percentages into a clamped percent.
 *
 * @param value Raw provider value.
 * @returns Normalized used percentage.
 */
export function normalizeUsedPercent(value: number): number {
	if (!Number.isFinite(value)) return 0;
	return clampPercent(value >= 0 && value <= 1 ? value * 100 : value);
}
