import { getContextColor } from "@extensions/neo-editor/features/promptline/render/getContextColor.js";
import { RESET } from "@extensions/neo-editor/features/promptline/render/constants.js";

/**
 * Renders the context usage meter using Neo promptline color and an extended bar.
 *
 * @param percent Context usage percent.
 * @returns ANSI-colored Neo-style context meter.
 */
export function renderNeoContextMeter(percent: number | null): string {
  const color = getContextColor(percent);
  return `${color} ${buildExtendedContextBar(percent)}${RESET}`;
}

/**
 * Builds the extended /context meter bar with two extra empty cells.
 *
 * @param percent Context usage percent.
 * @returns Seven-cell context meter bar.
 */
function buildExtendedContextBar(percent: number | null): string {
  const normalizedPercent = typeof percent === "number" && Number.isFinite(percent) ? Math.min(100, Math.max(0, percent)) : 0;
  const filledCells = Math.max(0, Math.min(7, Math.round((normalizedPercent / 100) * 7)));
  return `${"▰".repeat(filledCells)}${"▱".repeat(7 - filledCells)}`;
}
