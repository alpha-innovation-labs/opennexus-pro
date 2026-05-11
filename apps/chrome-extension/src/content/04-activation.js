function activate() {
  if (!isLocalhostPage()) return;
  if (isActive) {
    if (panelEl) panelEl.style.display = "";
    return;
  }
  isActive = true;
  showLauncher();
  ensureStyles();
  
  // Create UI
  createHighlight();
  createTooltip();
  createMarkers();
  createNotesContainer();
  createPanel();
  
  // Add listeners
  document.addEventListener("mousemove", onMouseMove, true);
  document.addEventListener("click", onClick, true);
  document.addEventListener("wheel", onWheel, { passive: false, capture: true });
  document.addEventListener("keydown", onKeyDown, true);
  window.addEventListener("scroll", handleScroll, true);
  window.addEventListener("resize", handleResize);
  initDragHandlers();
  
  document.body.style.cursor = "crosshair";
  console.log("[pi-annotate] Activated");
}

function resetState() {
  if (etchObserver) { etchObserver.disconnect(); etchObserver = null; }

  elementStack = [];
  stackIndex = 0;
  selectedElements = [];
  elementScreenshots = new Map();
  elementComments = new Map();
  elementFeedbackHistory = new Map();
  elementResolutionStatus = new Map();
  elementAnnotationIds = new Map();
  noteAnchors = new Map();
  openNotes = new Set();
  notePositions = new Map();
  dragState = null;
  screenshotMode = "none";
  liveMode = true;
  debugMode = false;
  resetCSSVarCache();
  etchMode = false;
  etchStartTime = null;
  etchInitialRules = null;
  etchStyleInitials = new Map();
  etchClassInitials = new Map();
  etchAttrInitials = new Map();
  etchTextInitials = new Map();
  etchChildListMutations = [];
  etchChangeCount = 0;
  updateEtchCounter();
  clearEtchMarkers();
  
  // Reset UI elements
  if (markersContainer) markersContainer.innerHTML = "";
  if (notesContainer) notesContainer.innerHTML = "";
  if (connectorsEl) connectorsEl.innerHTML = "";
  hideHighlight();
  hideTooltip();
  
  // Clear context input
  const contextEl = document.getElementById("pi-context");
  if (contextEl) contextEl.value = "";
  
  // Update count
  const countEl = document.getElementById("pi-count");
  if (countEl) countEl.textContent = "0 selected";
  
  console.log("[pi-annotate] State reset for new session");
}

function deactivate() {
  if (!isActive) return;
  isActive = false;
  
  document.removeEventListener("mousemove", onMouseMove, true);
  document.removeEventListener("click", onClick, true);
  document.removeEventListener("wheel", onWheel, { capture: true });
  document.removeEventListener("keydown", onKeyDown, true);
  window.removeEventListener("scroll", handleScroll, true);
  window.removeEventListener("resize", handleResize);
  cleanupDragHandlers();

  document.body.style.cursor = "";

  if (etchObserver) { etchObserver.disconnect(); etchObserver = null; }
  clearEtchMarkers();

  launcherEl?.remove();
  styleEl?.remove();
  highlightEl?.remove();
  tooltipEl?.remove();
  panelEl?.remove();
  markersContainer?.remove();
  notesContainer?.remove();
  connectorsEl?.remove();
  
  styleEl = highlightEl = tooltipEl = panelEl = markersContainer = launcherEl = null;
  notesContainer = connectorsEl = null;
  elementStack = [];
  stackIndex = 0;
  selectedElements = [];
  elementScreenshots = new Map();
  elementComments = new Map();
  elementFeedbackHistory = new Map();
  elementResolutionStatus = new Map();
  elementAnnotationIds = new Map();
  noteAnchors = new Map();
  openNotes = new Set();
  notePositions = new Map();
  dragState = null;
  requestId = null;
  screenshotMode = "none";
  liveMode = true;
  debugMode = false;
  resetCSSVarCache();
  etchMode = false;
  etchStartTime = null;
  etchInitialRules = null;
  etchStyleInitials = new Map();
  etchClassInitials = new Map();
  etchAttrInitials = new Map();
  etchTextInitials = new Map();
  etchChildListMutations = [];
  etchChangeCount = 0;
  
  console.log("[pi-annotate] Deactivated");
}
