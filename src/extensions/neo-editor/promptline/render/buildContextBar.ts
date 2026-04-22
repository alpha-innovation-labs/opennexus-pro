/**
 * Builds the promptline context meter bar.
 *
 * @param percent Context usage percent.
 * @returns Context meter bar.
 */
export function buildContextBar(percent: number | undefined | null): string {
  const normalizedPercent = typeof percent === "number" && Number.isFinite(percent)
    ? Math.min(100, Math.max(0, percent))
    : 0;
  const filledCells = Math.max(0, Math.min(5, Math.round((normalizedPercent / 100) * 5)));
  return `${"▰".repeat(filledCells)}${"▱".repeat(5 - filledCells)}`;
}
