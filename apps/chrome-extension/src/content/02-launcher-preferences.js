// ─────────────────────────────────────────────────────────────────────
// Launcher / Activation
// ─────────────────────────────────────────────────────────────────────

/**
 * Ensures the content-script stylesheet is mounted once for dynamic injection paths.
 */
function ensureStyles() {
  if (styleEl && document.contains(styleEl)) return;
  styleEl = document.getElementById("pi-styles-0");
  if (styleEl) return;
  var styleFiles = ["annotation-base.css", "annotation-panel.css", "annotation-notes.css", "annotation-debug.css", "annotation-responsive.css"];
  styleFiles.forEach((fileName, index) => {
    const link = document.createElement("link");
    link.id = `pi-styles-${index}`;
    link.rel = "stylesheet";
    link.href = chrome.runtime.getURL(`src/content/styles/${fileName}`);
    (document.head || document.documentElement).appendChild(link);
    if (index === 0) styleEl = link;
  });
}
function isLocalhostPage() {
  return window.location.hostname.includes("localhost");
}

/**
 * Reads the persisted workspace directory for the real Nexus agent.
 *
 * @returns {string} Workspace directory path.
 */
function readWorkspaceDirPreference() {
  return window.localStorage.getItem(WORKSPACE_DIR_STORAGE_KEY) || "";
}

/**
 * Persists the workspace directory for the real Nexus agent.
 *
 * @param {string} workspaceDir Local project directory.
 */
function writeWorkspaceDirPreference(workspaceDir) {
  window.localStorage.setItem(WORKSPACE_DIR_STORAGE_KEY, workspaceDir);
}

/**
 * Ensures the workspace input shows the directory that will be submitted.
 */
function syncWorkspaceDirInput() {
  const input = document.getElementById("pi-workspace-dir");
  if (input && !input.value) input.value = readWorkspaceDirPreference();
}

/**
 * Opens the browser's native directory picker affordance.
 */
async function openWorkspacePicker() {
  const input = document.getElementById("pi-workspace-dir");
  const response = await chrome.runtime.sendMessage({ type: "PICK_WORKSPACE_DIR" });
  if (response?.path) {
    input.value = response.path;
    writeWorkspaceDirPreference(response.path);
    input.dispatchEvent(new Event("change", { bubbles: true }));
  }
  input?.focus();
}

/**
 * Reads the persisted launcher visibility preference for this origin.
 *
 * @returns {boolean} True when the launcher should be restored on reload.
 */
function readLauncherVisibilityPreference() {
  return window.localStorage.getItem(LAUNCHER_VISIBILITY_STORAGE_KEY) === "true";
}

/**
 * Persists the launcher visibility preference for this origin.
 *
 * @param {boolean} visible Whether the launcher should persist across reloads.
 */
function writeLauncherVisibilityPreference(visible) {
  window.localStorage.setItem(LAUNCHER_VISIBILITY_STORAGE_KEY, String(visible));
}

/**
 * Reads current launcher visibility state for the extension popup.
 *
 * @returns {{ available: boolean, visible: boolean, expanded: boolean, active: boolean }} Launcher state.
 */
function getLauncherState() {
  return {
    available: isLocalhostPage(),
    visible: Boolean(launcherEl || isActive),
    expanded: Boolean(launcherEl?.classList.contains("pi-launcher-expanded")),
    active: isActive,
  };
}
