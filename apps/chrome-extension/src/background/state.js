export let nativePort = null;
export const requestTabs = new Map();
export const pendingHealthChecks = new Set();
export const pendingWorkspacePickers = new Map();

/**
 * Stores the active native messaging port.
 *
 * @param {chrome.runtime.Port|null} port Native messaging port.
 */
export function setNativePort(port) {
  nativePort = port;
}
