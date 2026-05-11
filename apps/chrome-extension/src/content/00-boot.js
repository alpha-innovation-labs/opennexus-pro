/**
 * Nexus Annotate - Content Script (v0.4.0)
 * 
 * DevTools-like element picker with inline note cards:
 * - Hover to highlight elements
 * - Alt/Option+scroll to cycle through parent elements
 * - Click to add elements to the multi-selection
 * - Per-element floating note cards with comments
 * - Bottom panel for overall context
 */

// Prevent double-injection (use Symbol for unique key to avoid conflicts)
var LOADED_KEY = "__nexusAnnotateLauncher_v2_" + chrome.runtime.id;
var shouldInitializeNexusAnnotate = !window[LOADED_KEY];
if (shouldInitializeNexusAnnotate) window[LOADED_KEY] = true;

// ─────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────

var SCREENSHOT_PADDING = 20;
var TEXT_MAX_LENGTH = 500;
var Z_INDEX_CONNECTORS = 2147483643;
var Z_INDEX_MARKERS = 2147483646;
var Z_INDEX_HIGHLIGHT = 2147483644;
var Z_INDEX_PANEL = 2147483646;
var Z_INDEX_TOOLTIP = 2147483647;
var IS_MAC = /Mac|iPhone|iPad/.test(navigator.platform);
var ALT_KEY_LABEL = IS_MAC ? "⌥" : "Alt";
var LAUNCHER_VISIBILITY_STORAGE_KEY = "nexusAnnotateLauncherVisible";
var WORKSPACE_DIR_STORAGE_KEY = "nexusAnnotateWorkspaceDir";

// HTML escape to prevent XSS when inserting user-controlled content
function escapeHtml(str) {
  if (str === null || str === undefined) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Check if element is part of extension UI and should not be annotated.
function isPiElement(el) {
  if (!el) return false;
  if (el.closest?.("#nexus-annotation-agent-sidebar")) return true;
  if (el.id?.startsWith("pi-")) return true;
  const cls = el.className;
  if (!cls) return false;
  // Handle both string className and SVGAnimatedString
  const clsStr = typeof cls === "string" ? cls : cls.baseVal || "";
  return clsStr.split(/\s+/).some(c => c.startsWith("pi-"));
}

// Update note card's displayed selector label
function updateNoteCardLabel(index) {
  const sel = selectedElements[index];
  if (!sel) return;
  const card = notesContainer?.querySelector(`[data-index="${index}"]`);
  if (!card) return;
  const label = sel.id ? `#${sel.id}` : `${sel.tag}${sel.classes[0] ? "." + sel.classes[0] : ""}`;
  const selectorEl = card.querySelector(".pi-note-selector");
  if (selectorEl) {
    selectorEl.textContent = label;
    selectorEl.title = sel.selector;
  }
}

// ─────────────────────────────────────────────────────────────────────
// State
// ─────────────────────────────────────────────────────────────────────

var isActive = false;
var requestId = null;
var screenshotMode = "none"; // screenshots are disabled for annotation-agent submissions
var liveMode = true;

// Element picker state
var elementStack = [];
var stackIndex = 0;
var selectedElements = [];
var elementScreenshots = new Map(); // index → boolean

// Note card state (v0.2.0)
var notesContainer = null;
var connectorsEl = null;
var elementComments = new Map(); // index → comment string
var elementFeedbackHistory = new Map(); // index → latest submitted feedback
var elementResolutionStatus = new Map(); // index → "draft" | "submitted" | "resolved"
var elementAnnotationIds = new Map(); // index → daemon annotation id
var openNotes = new Set();       // indices of currently open notes
var noteAnchors = new Map();     // index → {x, y} click position
var notePositions = new Map();   // index → {x, y} manual position overrides
var dragState = null;            // { card, startX, startY, startLeft, startTop }

// Debug mode state (v0.3.0)
var debugMode = false;
var cachedCSSVarNames = null;    // Cache for CSS variable discovery

// Edit capture state
var etchMode = false;
var etchObserver = null;
var etchStartTime = null;
var etchInitialRules = null;           // serialized stylesheet snapshot (ownerNode + ruleTexts[])
var etchStyleInitials = new Map();     // Element → initial style attribute value
var etchClassInitials = new Map();     // Element → initial class attribute value
var etchAttrInitials = new Map();      // Element → Map<attrName, oldValue> (non-style/class)
var etchTextInitials = new Map();      // Text node → initial text value
var etchChildListMutations = [];       // raw MutationRecords for structural changes
var etchChangeCount = 0;

// DOM elements
var highlightEl = null;
var tooltipEl = null;
var panelEl = null;
var markersContainer = null;
var launcherEl = null;
var styleEl = null;

// ─────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────
