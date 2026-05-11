import { sendToContentScript } from "./content-injection.js";
import { isRestrictedUrl } from "./is-restricted-url.js";
import { sendToNative } from "./native-port.js";
import { requestTabs } from "./state.js";

/**
 * Waits for a tab to finish loading, then injects the annotation content script.
 *
 * @param {number} tabId Chrome tab id.
 * @param {object} msg Message payload to forward.
 * @param {number|null} requestId Optional request id.
 */
export function injectAfterLoad(tabId, msg, requestId) {
  let timeoutId = null;
  const listener = (updatedTabId, info) => {
    if (updatedTabId !== tabId || info.status !== "complete") return;
    if (timeoutId) clearTimeout(timeoutId);
    chrome.tabs.onUpdated.removeListener(listener);
    setTimeout(() => {
      if (requestId) requestTabs.set(requestId, tabId);
      sendToContentScript(tabId, msg);
    }, 150);
  };
  chrome.tabs.onUpdated.addListener(listener);
  timeoutId = setTimeout(() => {
    chrome.tabs.onUpdated.removeListener(listener);
    console.log("[pi-annotate] Navigation timeout - listener removed");
    if (requestId) {
      requestTabs.delete(requestId);
      sendToNative({ type: "CANCEL", requestId, reason: "navigation_timeout" });
    }
  }, 30000);
}

/**
 * Resolves the active browser tab available for annotation UI.
 *
 * @returns {Promise<chrome.tabs.Tab | null>} Active tab, or null when unavailable.
 */
export async function getActiveAnnotationTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id || isRestrictedUrl(tab.url)) return null;
  return tab;
}
