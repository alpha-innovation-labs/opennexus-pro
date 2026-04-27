/**
 * Computes the outer modal width for a terminal width.
 *
 * @param terminalWidth Available terminal width.
 * @param minWidth Minimum desired modal width.
 * @param maxWidthRatio Maximum modal width as terminal ratio.
 * @returns Outer modal width.
 */
export function computeModalWidth(terminalWidth: number, minWidth: number, maxWidthRatio: number): number {
  const ratioWidth = Math.floor(terminalWidth * maxWidthRatio);
  return Math.max(20, Math.min(terminalWidth, Math.max(minWidth, ratioWidth)));
}
