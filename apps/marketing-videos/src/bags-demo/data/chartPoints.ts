/**
 * Returns normalized chart points for a volatile 30-day $NXS move from base to roughly 3000% higher.
 *
 * @returns Price points in a compact 0-100 coordinate space.
 */
export function getChartPoints(): readonly number[] {
  return [3, 4, 3, 6, 5, 9, 7, 13, 10, 18, 14, 24, 20, 33, 27, 42, 35, 51, 46, 63, 56, 74, 69, 88, 80, 96];
}
