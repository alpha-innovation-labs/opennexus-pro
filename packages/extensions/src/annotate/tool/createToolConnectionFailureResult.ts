/**
 * Creates the fixed tool response used when Chrome is not connected.
 *
 * @returns Connection failure tool result payload.
 */
export function createToolConnectionFailureResult() {
  return {
    content: [{ type: "text" as const, text: "Chrome extension not connected. Click the Nexus Annotate icon in Chrome to wake the service worker, then retry." }],
    details: { error: "Connection failed" },
  };
}
