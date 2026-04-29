/**
 * Calculates how many fetched Bags rows should be visible at the current frame.
 *
 * @param frame Local scene frame.
 * @param total Total rows available.
 * @returns Count of visible rows.
 */
export function getVisibleItemCount(frame: number, total: number): number {
  if (frame < 55) return 0;
  return Math.min(total, Math.floor((frame - 55) / 16) + 1);
}
