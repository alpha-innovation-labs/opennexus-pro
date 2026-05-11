// ─────────────────────────────────────────────────────────────────────
// Key Styles (always captured)
// ─────────────────────────────────────────────────────────────────────

var KEY_STYLE_DEFAULTS = {
  position: new Set(["static"]),
  overflow: new Set(["visible"]),
  zIndex: new Set(["auto"]),
  opacity: new Set(["1"]),
  color: new Set(["rgb(0, 0, 0)"]),
  backgroundColor: new Set(["rgba(0, 0, 0, 0)", "transparent"]),
  fontSize: new Set(["16px"]),
  fontWeight: new Set(["400", "normal"]),
};

/**
 * Get a small set of layout-critical CSS properties (always captured)
 * @param {Element} el - Target element
 * @returns {Record<string, string>}
 */
function getKeyStyles(el) {
  const computed = window.getComputedStyle(el);
  const styles = {};
  const display = computed.display;
  if (display) styles.display = display;
  for (const key of Object.keys(KEY_STYLE_DEFAULTS)) {
    const value = computed[key];
    if (value && !KEY_STYLE_DEFAULTS[key].has(value)) {
      styles[key] = value;
    }
  }
  return styles;
}

// ─────────────────────────────────────────────────────────────────────
// Debug Mode Helpers (v0.3.0)
// ─────────────────────────────────────────────────────────────────────

var COMPUTED_STYLE_KEYS = [
  // Layout
  "display", "position", "top", "right", "bottom", "left",
  "width", "height", "minWidth", "maxWidth", "minHeight", "maxHeight",
  // Flexbox
  "flexDirection", "flexWrap", "justifyContent", "alignItems", "alignSelf", "flex", "gap",
  // Grid
  "gridTemplateColumns", "gridTemplateRows", "gridColumn", "gridRow",
  // Visual
  "overflow", "overflowX", "overflowY", "zIndex", "opacity", "visibility",
  // Typography
  "color", "fontSize", "fontWeight", "fontFamily", "lineHeight", "textAlign",
  // Background & Border
  "backgroundColor", "backgroundImage", "borderRadius", "boxShadow",
  // Transform
  "transform", "transformOrigin",
  // Interaction
  "cursor", "pointerEvents", "userSelect"
];

var DEFAULT_STYLE_VALUES = new Set([
  "none", "auto", "normal", "visible", "static", "baseline",
  "0px", "0", "1", "start", "stretch", "row", "nowrap",
  "rgba(0, 0, 0, 0)", "rgb(0, 0, 0)", "transparent"
]);

/**
 * Get computed styles (debug mode only)
 * @param {Element} el - Target element
 * @returns {Record<string, string>}
 */
function getComputedStyles(el) {
  const computed = window.getComputedStyle(el);
  const styles = {};
  
  for (const key of COMPUTED_STYLE_KEYS) {
    const value = computed[key];
    if (value && !DEFAULT_STYLE_VALUES.has(value)) {
      styles[key] = value.length > 150 ? value.slice(0, 150) + "…" : value;
    }
  }
  
  return styles;
}

/**
 * Get parent element context (debug mode only)
 * @param {Element} el - Target element
 * @returns {ParentContext|null}
 */
function getParentContext(el) {
  let parent = el.parentElement;
  if (!parent || parent === document.body || parent === document.documentElement) {
    return null;
  }
  
  // Skip pi-annotate UI elements
  while (parent && isPiElement(parent)) {
    parent = parent.parentElement;
  }
  if (!parent || parent === document.body || parent === document.documentElement) {
    return null;
  }
  
  const computed = window.getComputedStyle(parent);
  const styles = {};
  
  styles.display = computed.display;
  styles.position = computed.position;
  
  if (computed.display.includes("flex")) {
    styles.flexDirection = computed.flexDirection;
    styles.flexWrap = computed.flexWrap;
    styles.justifyContent = computed.justifyContent;
    styles.alignItems = computed.alignItems;
    if (computed.gap && computed.gap !== "normal") {
      styles.gap = computed.gap;
    }
  }
  
  if (computed.display.includes("grid")) {
    styles.gridTemplateColumns = computed.gridTemplateColumns;
    styles.gridTemplateRows = computed.gridTemplateRows;
    if (computed.gap && computed.gap !== "normal") {
      styles.gap = computed.gap;
    }
  }
  
  if (computed.overflow !== "visible") {
    styles.overflow = computed.overflow;
  }
  
  return {
    tag: parent.tagName.toLowerCase(),
    id: parent.id || undefined,
    classes: Array.from(parent.classList),
    styles
  };
}
