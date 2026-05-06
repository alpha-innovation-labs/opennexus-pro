/**
 * Nexus Annotate - Background Service Worker
 * 
 * Connects to native messaging host and forwards messages between
 * the native host (Pi) and content scripts.
 */

let nativePort = null;
const requestTabs = new Map();
const pendingHealthChecks = new Set();

function getRequestId(msg) {
  return typeof msg.requestId === "number" ? msg.requestId : (typeof msg.id === "number" ? msg.id : null);
}

function isRestrictedUrl(url) {
  if (!url) return true;
  return /^(chrome|chrome-extension|edge|about|devtools|view-source):/.test(url);
}

function sendToNative(msg) {
  if (!nativePort) {
    console.error("[pi-annotate] Cannot send to native host - not connected");
    return;
  }
  try {
    nativePort.postMessage(msg);
  } catch (err) {
    console.error("[pi-annotate] Failed to send to native host:", err);
  }
}

/**
 * Resolves every popup health check waiting for a native host response.
 *
 * @param {{ ok: boolean, error?: string }} response Native host health result.
 */
function settlePendingHealthChecks(response) {
  for (const check of pendingHealthChecks) {
    clearTimeout(check.timeoutId);
    check.sendResponse(response);
  }
  pendingHealthChecks.clear();
}

/**
 * Checks the existing background-owned native host connection for the popup.
 *
 * @param {(response: { ok: boolean, error?: string }) => void} sendResponse Chrome response callback.
 */
function checkNativeConnection(sendResponse) {
  const port = nativePort || connectNative();
  if (!port) {
    sendResponse({ ok: false, error: "Native host not available" });
    return;
  }

  const check = {
    sendResponse,
    timeoutId: setTimeout(() => {
      if (!pendingHealthChecks.delete(check)) return;
      sendResponse({ ok: false, error: "Timeout - native host not responding" });
    }, 3000),
  };

  pendingHealthChecks.add(check);

  try {
    port.postMessage({ type: "PING" });
  } catch (err) {
    if (pendingHealthChecks.delete(check)) {
      clearTimeout(check.timeoutId);
      sendResponse({ ok: false, error: err?.message || "Failed to ping native host" });
    }
  }
}

// Send message to content script, injecting it first if needed
async function sendToContentScript(tabId, msg) {
  await requestContentScript(tabId, msg);
}

/**
 * Sends a request to a tab content script, injecting it first when needed.
 *
 * @param {number} tabId Chrome tab id.
 * @param {object} msg Message payload.
 * @returns {Promise<unknown>} Content-script response.
 */
async function requestContentScript(tabId, msg) {
  try {
    const response = await chrome.tabs.sendMessage(tabId, msg);
    if (response !== undefined || msg.type !== "GET_LAUNCHER_STATE") return response;
    console.log("[pi-annotate] Content script is stale, injecting current version...");
  } catch (err) {
    console.log("[pi-annotate] Content script not found, injecting...");
  }

  try {
    await chrome.scripting.executeScript({
      target: { tabId },
      files: ["content.js"],
    });
    await new Promise(r => setTimeout(r, 100));
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

// Wait for a tab to finish loading, then inject content script
function injectAfterLoad(tabId, msg, requestId) {
  let timeoutId = null;
  const listener = (updatedTabId, info) => {
    if (updatedTabId === tabId && info.status === "complete") {
      if (timeoutId) clearTimeout(timeoutId);
      chrome.tabs.onUpdated.removeListener(listener);
      setTimeout(() => {
        if (requestId) requestTabs.set(requestId, tabId);
        sendToContentScript(tabId, msg);
      }, 150);
    }
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
async function getActiveAnnotationTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id || isRestrictedUrl(tab.url)) return null;
  return tab;
}

// Toggle annotation picker on active tab (used by popup + keyboard shortcut)
async function togglePicker() {
  try {
    const tab = await getActiveAnnotationTab();
    if (!tab?.id) {
      console.log("[pi-annotate] Cannot toggle picker: no valid tab");
      return { available: false, visible: false, expanded: false, active: false };
    }
    return await requestContentScript(tab.id, { type: "TOGGLE_PICKER" });
  } catch (err) {
    console.error("[pi-annotate] Toggle picker failed:", err);
    return { available: false, visible: false, expanded: false, active: false, error: err?.message };
  }
}

/**
 * Reads the current launcher state from the active tab.
 *
 * @returns {Promise<unknown>} Launcher state response.
 */
async function getLauncherState() {
  try {
    const tab = await getActiveAnnotationTab();
    if (!tab?.id) return { available: false, visible: false, expanded: false, active: false };
    return await requestContentScript(tab.id, { type: "GET_LAUNCHER_STATE" });
  } catch (err) {
    return { available: false, visible: false, expanded: false, active: false, error: err?.message };
  }
}

/**
 * Checks whether the local annotations daemon is reachable.
 *
 * @returns {Promise<{ ok: boolean, error?: string }>} Daemon health result.
 */
async function checkAnnotationDaemonStatus() {
  try {
    const response = await fetch("http://127.0.0.1:47321/health");
    return response.ok ? { ok: true } : { ok: false, error: `Daemon returned ${response.status}` };
  } catch (err) {
    return { ok: false, error: err?.message || "Annotation daemon unreachable" };
  }
}

/**
 * Stores completed annotations directly when native messaging is unavailable.
 *
 * @param {object} msg Content-script completion payload.
 * @returns {Promise<void>}
 */
async function storeAnnotationDirectly(msg) {
  if (msg?.type !== "ANNOTATIONS_COMPLETE" || !msg.result?.success) return null;
  try {
    const response = await fetch("http://127.0.0.1:47321/annotations", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(msg.result),
    });
    if (!response.ok) console.error("[pi-annotate] Annotation daemon rejected capture:", response.status);
    return await response.json().catch(() => null);
  } catch (err) {
    console.error("[pi-annotate] Annotation daemon capture failed:", err?.message || err);
    return null;
  }
}

function connectNative() {
  if (nativePort) return nativePort;

  console.log("[pi-annotate] Connecting to native host...");
  try {
    nativePort = chrome.runtime.connectNative("com.nexus.annotate");
  } catch (err) {
    const error = err?.message || "Failed to connect to native host";
    console.error("[pi-annotate] Native host connection failed:", error);
    settlePendingHealthChecks({ ok: false, error });
    return null;
  }
  
  nativePort.onMessage.addListener((msg) => {
    if (msg?.type === "PONG") {
      settlePendingHealthChecks({ ok: true });
      return;
    }

    console.log("[pi-annotate] From native host:", msg);
    
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs[0]?.id) {
        console.log("[pi-annotate] No active tab found");
        const requestId = getRequestId(msg);
        if (requestId) {
          sendToNative({ type: "CANCEL", requestId, reason: "No active browser tab found" });
        }
        return;
      }
      
      const requestId = getRequestId(msg);
      const tabId = requestId && requestTabs.has(requestId) ? requestTabs.get(requestId) : tabs[0].id;
      const currentUrl = tabs[0].url;
      
      if (msg.type === "START_ANNOTATION") {
        const restricted = isRestrictedUrl(currentUrl);

        if (msg.url && (restricted || currentUrl !== msg.url)) {
          if (restricted) {
            console.log("[pi-annotate] Opening new tab:", msg.url);
            chrome.tabs.create({ url: msg.url }, (tab) => {
              if (chrome.runtime.lastError) {
                console.error("[pi-annotate] Failed to create tab:", chrome.runtime.lastError.message);
                sendToNative({ type: "CANCEL", requestId, reason: chrome.runtime.lastError.message });
                return;
              }
              injectAfterLoad(tab.id, msg, requestId);
            });
          } else {
            console.log("[pi-annotate] Navigating to:", msg.url);
            chrome.tabs.update(tabId, { url: msg.url }, (tab) => {
              if (chrome.runtime.lastError) {
                console.error("[pi-annotate] Failed to navigate:", chrome.runtime.lastError.message);
                sendToNative({ type: "CANCEL", requestId, reason: chrome.runtime.lastError.message });
                return;
              }
              injectAfterLoad(tab.id, msg, requestId);
            });
          }
        } else if (restricted) {
          console.log("[pi-annotate] Cannot annotate restricted tab:", currentUrl);
          if (requestId) {
            sendToNative({ type: "CANCEL", requestId, reason: "Current tab cannot be annotated (restricted URL). Provide a URL." });
          }
        } else {
          console.log("[pi-annotate] Activating on current tab:", currentUrl);
          if (requestId) requestTabs.set(requestId, tabId);
          sendToContentScript(tabId, msg);
        }
      } else {
        sendToContentScript(tabId, msg);
      }
    });
  });
  
  nativePort.onDisconnect.addListener(() => {
    const error = chrome.runtime.lastError?.message || "Native host disconnected";
    console.log("[pi-annotate] Native host disconnected");
    settlePendingHealthChecks({ ok: false, error });
    nativePort = null;
    setTimeout(connectNative, 2000);
  });

  return nativePort;
}

// Handle messages from content script and popup
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  console.log("[pi-annotate] Message:", msg.type);
  
  if (msg.type === "TOGGLE_PICKER") {
    togglePicker().then(sendResponse);
    return true;
  }

  if (msg.type === "GET_LAUNCHER_STATE") {
    getLauncherState().then(sendResponse);
    return true;
  }

  if (msg.type === "CHECK_ANNOTATION_DAEMON") {
    checkAnnotationDaemonStatus().then(sendResponse);
    return true;
  }

  if (msg.type === "CHECK_NATIVE_CONNECTION") {
    checkNativeConnection(sendResponse);
    return true;
  }
  
  const requestId = getRequestId(msg);
  
  if (msg.type === "CAPTURE_SCREENSHOT") {
    if (!sender.tab?.windowId) {
      console.log("[pi-annotate] Screenshot failed: No window ID");
      sendResponse({ error: "No window ID" });
      return true;
    }
    chrome.tabs.captureVisibleTab(sender.tab.windowId, { format: "png" }, (dataUrl) => {
      if (chrome.runtime.lastError) {
        console.log("[pi-annotate] Screenshot error:", chrome.runtime.lastError.message);
        sendResponse({ error: chrome.runtime.lastError.message });
      } else {
        console.log("[pi-annotate] Screenshot captured, size:", dataUrl?.length || 0);
        sendResponse({ dataUrl });
      }
    });
    return true;
  }
  
  if (["ANNOTATIONS_COMPLETE", "CANCEL"].includes(msg.type)) {
    if (requestId) requestTabs.delete(requestId);
    if (!nativePort && msg.type === "ANNOTATIONS_COMPLETE") {
      storeAnnotationDirectly(msg).then(sendResponse);
      return true;
    }
    console.log("[pi-annotate] Forwarding to native host:", msg.type);
    sendToNative(msg);
  }
});

// Handle keyboard shortcut
chrome.commands.onCommand.addListener((command) => {
  if (command === "toggle-picker") {
    togglePicker();
  }
});

// Connect on startup
connectNative();
console.log("[pi-annotate] Background script loaded");
