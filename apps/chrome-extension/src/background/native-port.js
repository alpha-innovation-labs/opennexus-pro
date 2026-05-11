import { getRequestId } from "./get-request-id.js";
import { handleNativeAnnotationMessage } from "./native-message-handler.js";
import { settlePendingHealthChecks, settlePendingWorkspacePicker } from "./native-health.js";
import { nativePort, setNativePort } from "./state.js";

/**
 * Sends a message to the connected native messaging host.
 *
 * @param {object} msg Message payload.
 */
export function sendToNative(msg) {
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
 * Connects to the Nexus native messaging host and installs port listeners.
 *
 * @returns {chrome.runtime.Port|null} Native messaging port when available.
 */
export function connectNative() {
  if (nativePort) return nativePort;
  console.log("[pi-annotate] Connecting to native host...");
  try {
    setNativePort(chrome.runtime.connectNative("com.nexus.annotate"));
  } catch (err) {
    const error = err?.message || "Failed to connect to native host";
    console.error("[pi-annotate] Native host connection failed:", error);
    settlePendingHealthChecks({ ok: false, error });
    return null;
  }
  nativePort.onMessage.addListener(handleNativePortMessage);
  nativePort.onDisconnect.addListener(handleNativeDisconnect);
  return nativePort;
}

/**
 * Handles one native messaging payload.
 *
 * @param {object} msg Native host payload.
 */
function handleNativePortMessage(msg) {
  if (msg?.type === "PONG") {
    settlePendingHealthChecks({ ok: true });
    return;
  }
  if (msg?.type === "WORKSPACE_DIR_SELECTED") {
    if (settlePendingWorkspacePicker(msg)) return;
    if (!getRequestId(msg)) return;
  }
  handleNativeAnnotationMessage(msg);
}

/** Handles native host disconnects and schedules reconnect. */
function handleNativeDisconnect() {
  const error = chrome.runtime.lastError?.message || "Native host disconnected";
  console.log("[pi-annotate] Native host disconnected");
  settlePendingHealthChecks({ ok: false, error });
  setNativePort(null);
  setTimeout(connectNative, 2000);
}
