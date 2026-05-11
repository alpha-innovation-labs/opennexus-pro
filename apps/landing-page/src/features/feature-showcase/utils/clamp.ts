/**
 * Constrains a number to an inclusive range.
 *
 * @param value Number to constrain.
 * @param min Minimum allowed value.
 * @param max Maximum allowed value.
 * @returns The constrained number.
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(value, max));
}
