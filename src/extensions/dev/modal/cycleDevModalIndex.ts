/**
 * Cycles a modal variation index through a bounded list.
 *
 * @param current Current selected index.
 * @param direction Navigation direction.
 * @param total Total item count.
 * @returns Wrapped selected index.
 */
export function cycleDevModalIndex(current: number, direction: 1 | -1, total: number): number {
  if (total <= 0) return 0;
  return (current + direction + total) % total;
}
