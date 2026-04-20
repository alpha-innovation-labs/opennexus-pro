/**
 * Creates the fixed tool response used when an annotation run is aborted.
 *
 * @returns Aborted tool result payload.
 */
export function createToolAbortResult() {
  return {
    content: [{ type: "text" as const, text: "Annotation was aborted." }],
    details: { aborted: true },
  };
}
