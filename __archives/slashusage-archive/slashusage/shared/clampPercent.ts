/**
 * Clamps a percentage to the 0-100 range.
 *
 * @param value Input percentage.
 * @returns Safe percentage value.
 */
export function clampPercent(value: number): number {
	if (!Number.isFinite(value)) return 0;
	return Math.max(0, Math.min(100, Math.round(value)));
}
