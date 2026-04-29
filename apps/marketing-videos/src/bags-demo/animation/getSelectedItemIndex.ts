/**
 * Selects the highlighted Bags row as the demo progresses.
 *
 * @param frame Local scene frame.
 * @param total Total rows available.
 * @returns Highlighted row index.
 */
export function getSelectedItemIndex(frame: number, total: number): number {
  if (total <= 0) return 0;
  if (frame < 132) return 0;
  if (frame < 184) return Math.min(1, total - 1);
  return Math.min(2, total - 1);
}
