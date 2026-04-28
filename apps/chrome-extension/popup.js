// Nexus Annotate - Popup Script

const extId = chrome.runtime.id;
const installCmd = `./install.sh ${extId}`;

// Elements
const extIdInput = document.getElementById('ext-id');
const installCmdInput = document.getElementById('install-cmd');
const statusDot = document.getElementById('status-dot');
const statusText = document.getElementById('status-text');
const setupSection = document.getElementById('setup-section');
const readySection = document.getElementById('ready-section');
const troubleSection = document.getElementById('trouble-section');
const quickStartBtn = document.getElementById('quick-start-btn');

// Populate fields
extIdInput.value = extId;
installCmdInput.value = installCmd;

// Platform-aware displays
const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
const shortcutEl = document.getElementById('shortcut-key');
if (shortcutEl) {
  shortcutEl.textContent = isMac ? '⌘ Shift P' : 'Ctrl+Shift+P';
}
const quitTipEl = document.getElementById('quit-tip');
if (quitTipEl) {
  // Mac has ⌘Q, Windows/Linux don't have a universal quit shortcut
  quitTipEl.textContent = isMac 
    ? 'Fully quit Chrome (⌘Q) and reopen' 
    : 'Fully quit Chrome (menu → Exit) and reopen';
}

// Copy functionality
function copyToClipboard(text, btn) {
  navigator.clipboard.writeText(text).then(() => {
    const original = btn.textContent;
    btn.textContent = 'Copied!';
    btn.classList.add('copied');
    setTimeout(() => {
      btn.textContent = original;
      btn.classList.remove('copied');
    }, 1500);
  }).catch(() => {
    // Fallback: select the input text
    const input = btn.previousElementSibling;
    if (input?.select) {
      input.select();
      btn.textContent = 'Select All';
      setTimeout(() => { btn.textContent = 'Copy'; }, 1500);
    }
  });
}

document.getElementById('copy-id').addEventListener('click', (e) => {
  copyToClipboard(extId, e.target);
});

document.getElementById('copy-cmd').addEventListener('click', (e) => {
  copyToClipboard(installCmd, e.target);
});

/**
 * Toggles the in-page annotation launcher through the background script.
 */
function startAnnotation() {
  chrome.runtime.sendMessage({ type: "TOGGLE_PICKER" }, (response) => {
    updateToggleButtonState(response || { available: false, visible: false });
  });
}

// Annotation bar toggle — always available, even while connection status is checking.
quickStartBtn?.addEventListener('click', startAnnotation);
document.getElementById('start-btn')?.addEventListener('click', startAnnotation);

// Retry button
document.getElementById('retry-btn')?.addEventListener('click', () => {
  checkConnection();
});

// Update UI based on connection state
function setConnected() {
  statusDot.className = 'status-dot connected';
  statusText.textContent = 'Annotation daemon connected';
  setupSection.style.display = 'none';
  readySection.style.display = 'block';
  troubleSection.style.display = 'none';
}

function setNotInstalled(detail) {
  statusDot.className = 'status-dot';
  statusText.textContent = detail || 'Not installed';
  setupSection.style.display = 'block';
  readySection.style.display = 'none';
  troubleSection.style.display = 'none';
}

function setTrouble(error) {
  statusDot.className = 'status-dot trouble';
  statusText.textContent = 'Connection issue';
  setupSection.style.display = 'block';
  readySection.style.display = 'none';
  troubleSection.style.display = 'block';
  document.getElementById('trouble-detail').textContent = error || 'Unknown error';
}

function setChecking() {
  statusDot.className = 'status-dot checking';
  statusText.textContent = 'Checking...';
  setupSection.style.display = 'block';
  readySection.style.display = 'none';
  troubleSection.style.display = 'none';
  updateToggleButtonState(null);
}

/**
 * Updates the annotation bar toggle button from active-tab launcher state.
 *
 * @param {{available?: boolean, visible?: boolean}|null} state Launcher state.
 */
function updateToggleButtonState(state) {
  if (!quickStartBtn) return;
  quickStartBtn.disabled = false;
  if (!state) {
    quickStartBtn.textContent = 'Checking…';
    return;
  }
  if (!state.available) {
    quickStartBtn.textContent = 'Only available on localhost';
    quickStartBtn.disabled = true;
    return;
  }
  quickStartBtn.textContent = state.visible ? 'Hide Annotation Bar' : 'Show Annotation Bar';
}

/**
 * Refreshes the annotation launcher toggle state from the active tab.
 */
function refreshLauncherState() {
  chrome.runtime.sendMessage({ type: 'GET_LAUNCHER_STATE' }, (response) => {
    updateToggleButtonState(response || { available: false, visible: false });
  });
}

/**
 * Checks the local annotations daemon status.
 */
function checkConnection() {
  setChecking();

  chrome.runtime.sendMessage({ type: 'CHECK_ANNOTATION_DAEMON' }, (response) => {
    const error = chrome.runtime.lastError?.message || response?.error || '';

    if (response?.ok) {
      setConnected();
      refreshLauncherState();
      return;
    }

    setTrouble(error || 'Annotation daemon not responding');
    refreshLauncherState();
  });
}

// Check on load
checkConnection();
