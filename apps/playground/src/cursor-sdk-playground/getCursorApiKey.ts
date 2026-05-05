/**
 * Resolves the Cursor API key required by the Cursor SDK.
 *
 * @returns Cursor API key from the environment.
 * @throws When CURSOR_API_KEY is not set.
 */
export function getCursorApiKey(): string {
  const apiKey = process.env.CURSOR_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("Set CURSOR_API_KEY to a Cursor dashboard API key before running just playground.");
  }
  return apiKey;
}
