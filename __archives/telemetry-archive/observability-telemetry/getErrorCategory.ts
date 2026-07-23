/**
 * Creates a sanitized error category suitable for telemetry.
 *
 * @param error Unknown thrown value.
 * @returns Error category without message, stack, or path data.
 */
export function getErrorCategory(error: unknown): string {
  if (error instanceof Error && error.name.trim().length > 0) {
    return error.name.slice(0, 80);
  }
  return typeof error;
}
