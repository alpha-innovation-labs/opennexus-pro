/**
 * Cycles the selected model/subscription tab index.
 *
 * @param index Current index.
 * @param direction Navigation direction.
 * @param count Number of options.
 * @returns Next selected index.
 */
export function cycleUsageHistoryModelIndex(index: number, direction: 1 | -1, count: number): number {
  if (count <= 0) return 0;
  return (((index + direction) % count) + count) % count;
}
