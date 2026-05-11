if (shouldInitializeNexusAnnotate) {
// ─────────────────────────────────────────────────────────────────────
// Message Handling
// ─────────────────────────────────────────────────────────────────────

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  console.log("[pi-annotate] Received:", msg.type);
  
  if (msg.type === "START_ANNOTATION") {
    requestId = msg.requestId || msg.id || null;
    activate();
    sendResponse?.(getLauncherState());
  } else if (msg.type === "TOGGLE_PICKER") {
    toggleLauncher();
    sendResponse?.(getLauncherState());
  } else if (msg.type === "SHOW_LAUNCHER") {
    showLauncher();
    sendResponse?.(getLauncherState());
  } else if (msg.type === "HIDE_LAUNCHER") {
    hideToolbarOnly();
    sendResponse?.(getLauncherState());
  } else if (msg.type === "GET_LAUNCHER_STATE") {
    sendResponse?.(getLauncherState());
  } else if (msg.type === "CANCEL") {
    if (isActive) {
      deactivate();
    }
    sendResponse?.(getLauncherState());
  }
});
}
