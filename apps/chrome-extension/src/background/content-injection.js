import { contentScriptFiles, contentStyleFiles } from "./content-assets.js";
import { getRequestId } from "./get-request-id.js";
import { requestTabs } from "./state.js";
import { sendToNative } from "./native-port.js";

/**
 * Injects all content-script CSS files into a tab.
 *
 * @param {number} tabId Chrome tab id.
 * @returns {Promise<void>} Resolves after CSS injection.
 */
async function injectContentStyles(tabId) {
  await chrome.scripting.insertCSS({ target: { tabId }, files: contentStyleFiles });
}

/**
 * Sends a request to a tab content script, injecting it first when needed.
 *
 * @param {number} tabId Chrome tab id.
 * @param {object} msg Message payload.
 * @returns {Promise<unknown>} Content-script response.
 */
export async function requestContentScript(tabId, msg) {
  try {
    const response = await chrome.tabs.sendMessage(tabId, msg);
    if (response !== undefined || msg.type !== "GET_LAUNCHER_STATE") return response;
    console.log("[pi-annotate] Content script is stale, injecting current version...");
  } catch {
    console.log("[pi-annotate] Content script not found, injecting...");
  }
  try {
    await injectContentStyles(tabId);
    await chrome.scripting.executeScript({ target: { tabId }, files: contentScriptFiles });
    await new Promise((resolve) => setTimeout(resolve, 100));
    return await chrome.tabs.sendMessage(tabId, msg);
  } catch (injectErr) {
    console.error("[pi-annotate] Failed to inject:", injectErr.message);
    const requestId = getRequestId(msg);
    if (requestId) {
      requestTabs.delete(requestId);
      sendToNative({ type: "CANCEL", requestId, reason: `Cannot inject into tab: ${injectErr.message}` });
    }
    throw injectErr;
  }
}

/**
 * Sends a fire-and-forget request to a tab content script.
 *
 * @param {number} tabId Chrome tab id.
 * @param {object} msg Message payload.
 */
export async function sendToContentScript(tabId, msg) {
  await requestContentScript(tabId, msg);
}
