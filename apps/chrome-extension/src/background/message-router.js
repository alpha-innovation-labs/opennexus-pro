import { checkAnnotationDaemonStatus, storeAnnotationDirectly } from "./daemon-api.js";
import { getLauncherState, togglePicker } from "./launcher-actions.js";
import { checkNativeConnection, pickWorkspaceDirectory } from "./native-requests.js";
import { sendToNative } from "./native-port.js";
import { getRequestId } from "./get-request-id.js";
import { nativePort, requestTabs } from "./state.js";

/**
 * Routes messages from content scripts and popup UI.
 *
 * @param {object} msg Message payload.
 * @param {chrome.runtime.MessageSender} sender Message sender.
 * @param {(response?: unknown) => void} sendResponse Chrome response callback.
 * @returns {boolean|undefined} True when responding asynchronously.
 */
export function routeRuntimeMessage(msg, sender, sendResponse) {
  console.log("[pi-annotate] Message:", msg.type);
  if (msg.type === "TOGGLE_PICKER") return respondWith(togglePicker(), sendResponse);
  if (msg.type === "GET_LAUNCHER_STATE") return respondWith(getLauncherState(), sendResponse);
  if (msg.type === "CHECK_ANNOTATION_DAEMON") return respondWith(checkAnnotationDaemonStatus(), sendResponse);
  if (msg.type === "CHECK_NATIVE_CONNECTION") {
    checkNativeConnection(sendResponse);
    return true;
  }
  if (msg.type === "PICK_WORKSPACE_DIR") {
    pickWorkspaceDirectory(sendResponse);
    return true;
  }
  if (msg.type === "CAPTURE_SCREENSHOT") return captureVisibleTab(sender, sendResponse);
  if (["ANNOTATIONS_COMPLETE", "CANCEL"].includes(msg.type)) return forwardAnnotationResult(msg, sendResponse);
}

/**
 * Sends a promise result to Chrome's response callback.
 *
 * @param {Promise<unknown>} promise Async work.
 * @param {(response?: unknown) => void} sendResponse Chrome response callback.
 * @returns {true} Keeps the message channel open.
 */
function respondWith(promise, sendResponse) {
  promise.then(sendResponse);
  return true;
}

/**
 * Captures the visible browser tab for content-script screenshot requests.
 *
 * @param {chrome.runtime.MessageSender} sender Message sender.
 * @param {(response?: unknown) => void} sendResponse Chrome response callback.
 * @returns {true} Keeps the message channel open.
 */
function captureVisibleTab(sender, sendResponse) {
  if (!sender.tab?.windowId) {
    sendResponse({ error: "No window ID" });
    return true;
  }
  chrome.tabs.captureVisibleTab(sender.tab.windowId, { format: "png" }, (dataUrl) => {
    if (chrome.runtime.lastError) sendResponse({ error: chrome.runtime.lastError.message });
    else sendResponse({ dataUrl });
  });
  return true;
}

/**
 * Forwards completed or cancelled annotation sessions to native host or daemon fallback.
 *
 * @param {object} msg Annotation result message.
 * @param {(response?: unknown) => void} sendResponse Chrome response callback.
 * @returns {true|undefined} True when responding asynchronously.
 */
function forwardAnnotationResult(msg, sendResponse) {
  const requestId = getRequestId(msg);
  if (requestId) requestTabs.delete(requestId);
  if (!nativePort && msg.type === "ANNOTATIONS_COMPLETE") return respondWith(storeAnnotationDirectly(msg), sendResponse);
  console.log("[pi-annotate] Forwarding to native host:", msg.type);
  sendToNative(msg);
}
