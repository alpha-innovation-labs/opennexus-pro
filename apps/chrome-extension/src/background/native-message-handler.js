import { getRequestId } from "./get-request-id.js";
import { isRestrictedUrl } from "./is-restricted-url.js";
import { sendToContentScript } from "./content-injection.js";
import { sendToNative } from "./native-port.js";
import { requestTabs } from "./state.js";
import { injectAfterLoad } from "./tab-actions.js";

/**
 * Routes one native host message to the appropriate browser tab.
 *
 * @param {object} msg Native host message.
 */
export function handleNativeAnnotationMessage(msg) {
  console.log("[pi-annotate] From native host:", msg);
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (!tabs[0]?.id) {
      console.log("[pi-annotate] No active tab found");
      const requestId = getRequestId(msg);
      if (requestId) sendToNative({ type: "CANCEL", requestId, reason: "No active browser tab found" });
      return;
    }
    const requestId = getRequestId(msg);
    const tabId = requestId && requestTabs.has(requestId) ? requestTabs.get(requestId) : tabs[0].id;
    const currentUrl = tabs[0].url;
    if (msg.type !== "START_ANNOTATION") {
      sendToContentScript(tabId, msg);
      return;
    }
    routeStartAnnotationMessage({ msg, requestId, tabId, currentUrl });
  });
}

/**
 * Routes START_ANNOTATION messages through navigation when needed.
 *
 * @param {{msg: object, requestId: number|null, tabId: number, currentUrl?: string}} input Routing input.
 */
function routeStartAnnotationMessage(input) {
  const restricted = isRestrictedUrl(input.currentUrl);
  if (input.msg.url && (restricted || input.currentUrl !== input.msg.url)) {
    openOrNavigateAnnotationTab(input, restricted);
  } else if (restricted) {
    console.log("[pi-annotate] Cannot annotate restricted tab:", input.currentUrl);
    if (input.requestId) sendToNative({ type: "CANCEL", requestId: input.requestId, reason: "Current tab cannot be annotated (restricted URL). Provide a URL." });
  } else {
    console.log("[pi-annotate] Activating on current tab:", input.currentUrl);
    if (input.requestId) requestTabs.set(input.requestId, input.tabId);
    sendToContentScript(input.tabId, input.msg);
  }
}

/**
 * Opens or navigates a tab for START_ANNOTATION target URLs.
 *
 * @param {{msg: object, requestId: number|null, tabId: number}} input Routing input.
 * @param {boolean} restricted Whether the current tab is restricted.
 */
function openOrNavigateAnnotationTab(input, restricted) {
  const action = restricted ? chrome.tabs.create : chrome.tabs.update;
  const target = restricted ? { url: input.msg.url } : [input.tabId, { url: input.msg.url }];
  console.log("[pi-annotate]", restricted ? "Opening new tab:" : "Navigating to:", input.msg.url);
  const callback = (tab) => {
    if (chrome.runtime.lastError) {
      console.error("[pi-annotate] Failed to prepare tab:", chrome.runtime.lastError.message);
      if (input.requestId) sendToNative({ type: "CANCEL", requestId: input.requestId, reason: chrome.runtime.lastError.message });
      return;
    }
    injectAfterLoad(tab.id, input.msg, input.requestId);
  };
  if (Array.isArray(target)) action(...target, callback);
  else action(target, callback);
}
