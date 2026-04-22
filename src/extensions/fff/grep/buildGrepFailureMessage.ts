/**
 * Builds a user-facing grep failure message.
 *
 * @param error Failure cause.
 * @returns Failure text.
 */
export function buildGrepFailureMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
