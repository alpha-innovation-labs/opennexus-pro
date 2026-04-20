/**
 * Creates the fixed tool response used when an annotation run times out.
 *
 * @param timeoutSeconds Configured timeout in seconds.
 * @returns Timeout tool result payload.
 */
export function createToolTimeoutResult(timeoutSeconds: number) {
  return {
    content: [{ type: "text" as const, text: `Annotation timed out after ${timeoutSeconds}s` }],
    details: { timeout: true },
  };
}
