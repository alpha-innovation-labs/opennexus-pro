// ─────────────────────────────────────────────────────────────────────
// UI Creation
// ─────────────────────────────────────────────────────────────────────

function createHighlight() {
  highlightEl = document.createElement("div");
  highlightEl.id = "pi-highlight";
  highlightEl.style.display = "none";
  document.body.appendChild(highlightEl);
}

function createTooltip() {
  tooltipEl = document.createElement("div");
  tooltipEl.id = "pi-tooltip";
  tooltipEl.style.display = "none";
  document.body.appendChild(tooltipEl);
}

function createMarkers() {
  markersContainer = document.createElement("div");
  markersContainer.id = "pi-markers";
  document.body.appendChild(markersContainer);
}

function createNotesContainer() {
  notesContainer = document.createElement("div");
  notesContainer.className = "pi-notes-container";
  document.body.appendChild(notesContainer);
  
  connectorsEl = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  connectorsEl.setAttribute("class", "pi-connectors");
  document.body.appendChild(connectorsEl);
}

function createPanel() {
  panelEl = document.createElement("div");
  panelEl.id = "pi-panel";
  panelEl.innerHTML = `
    <div class="pi-header">
      <span class="pi-hint">Click elements • ${ALT_KEY_LABEL}+scroll cycles parents • ESC to close</span>
      <button class="pi-close" id="pi-close" title="Close (ESC)">×</button>
    </div>
    <div class="pi-toolbar">
      <button class="pi-ss-btn active" id="pi-live-toggle" title="Submit each note to Nexus when Enter is pressed">Live</button>
      <div class="pi-spacer"></div>
      <span class="pi-count" id="pi-count">0 selected</span>
    </div>
    <div class="pi-context-row">
      <input type="text" id="pi-workspace-dir" placeholder="Project directory for Nexus agent" value="${escapeHtml(readWorkspaceDirPreference())}" />
      <input type="text" id="pi-context" placeholder="General context (optional)..." />
    </div>
    <div class="pi-actions">
      <div class="pi-buttons">
        <button class="pi-btn pi-btn-submit" id="pi-submit">Submit</button>
      </div>
    </div>
    <input class="pi-hidden" type="file" id="pi-workspace-picker" webkitdirectory directory />
  `;
  document.body.appendChild(panelEl);
  syncWorkspaceDirInput();
  
  document.getElementById("pi-close").addEventListener("click", hideActiveAnnotationPanel);
  document.getElementById("pi-submit").addEventListener("click", handleSubmit);
  document.getElementById("pi-live-toggle").addEventListener("click", toggleLiveMode);
  document.getElementById("pi-workspace-dir").addEventListener("change", (event) => {
    writeWorkspaceDirPreference(event.target.value.trim());
  });
  document.getElementById("pi-workspace-dir").addEventListener("click", () => void openWorkspacePicker());
  
  // Stop events from reaching the page
  panelEl.addEventListener("mousemove", e => e.stopPropagation(), true);
  panelEl.addEventListener("click", e => {
    const target = e.target;
    if (target.tagName === "BUTTON" || target.tagName === "INPUT" || target.tagName === "TEXTAREA") {
      return;
    }
    e.stopPropagation();
  }, true);
}

/**
 * Toggles live note submission mode.
 */
function toggleLiveMode() {
  liveMode = !liveMode;
  document.getElementById("pi-live-toggle")?.classList.toggle("active", liveMode);
  window.NexusAnnotationSidebar?.show?.();
}
