/**
 * Renders the launcher's expanded or collapsed state.
 *
 * @param {boolean} expanded Whether the launcher bar is expanded.
 */
function setLauncherExpanded(expanded) {
  if (!launcherEl) return;
  launcherEl.classList.toggle("pi-launcher-expanded", expanded);
  launcherEl.setAttribute("aria-expanded", String(expanded));
}

/**
 * Handles clicks on the launcher shell when the visible target is the collapsed N.
 *
 * @param {MouseEvent} event Launcher click event.
 */
function handleLauncherShellClick(event) {
  if (event.target !== launcherEl) return;
  setLauncherExpanded(!launcherEl.classList.contains("pi-launcher-expanded"));
}

/**
 * Shows the compact launcher toolbar used to start annotation mode.
 */
function showLauncher() {
  if (!isLocalhostPage() || isActive || launcherEl) return;
  writeLauncherVisibilityPreference(true);
  ensureStyles();
  launcherEl = document.createElement("div");
  launcherEl.id = "pi-launcher";
  launcherEl.setAttribute("aria-label", "Nexus annotation launcher");
  launcherEl.innerHTML = `
    <button class="pi-launcher-mark" id="pi-launcher-toggle" title="Start annotation">N</button>
  `;
  document.body.appendChild(launcherEl);
  document.getElementById("pi-launcher-toggle")?.addEventListener("click", () => {
    activate();
  });
}

/**
 * Hides the compact launcher toolbar.
 *
 * @param {{ keepStyles?: boolean }} options Launcher cleanup options.
 */
function hideLauncher() {
  showLauncher();
}

/**
 * Toggles the compact launcher toolbar from the extension action.
 */
function toggleLauncher() {
  if (!isLocalhostPage()) return;
  if (isActive) {
    hideToolbarOnly();
    return;
  }
  showLauncher();
}

/**
 * Restores the launcher after page reload when the extension toggle left it visible.
 */
function restoreLauncherVisibility() {
  if (isLocalhostPage()) showLauncher();
}
