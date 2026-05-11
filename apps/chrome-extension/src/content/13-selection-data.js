// ─────────────────────────────────────────────────────────────────────
// Selection
// ─────────────────────────────────────────────────────────────────────

function selectElement(el) {
  selectedElements.push(createSelectionData(el));
}

function generateSelector(el) {
  if (el.id && /^[a-zA-Z][\w-]*$/.test(el.id)) return `#${el.id}`;
  
  if (el.classList.length) {
    const classes = Array.from(el.classList).filter(c => /^[a-zA-Z][\w-]*$/.test(c));
    if (classes.length) {
      const sel = el.tagName.toLowerCase() + "." + classes.join(".");
      try { if (document.querySelectorAll(sel).length === 1) return sel; } catch {}
    }
  }
  
  const path = [];
  let cur = el;
  while (cur && cur !== document.body) {
    let part = cur.tagName.toLowerCase();
    if (cur.id && /^[a-zA-Z][\w-]*$/.test(cur.id)) {
      path.unshift(`#${cur.id}`);
      break;
    }
    const parent = cur.parentElement;
    if (parent) {
      const sibs = Array.from(parent.children).filter(c => c.tagName === cur.tagName);
      if (sibs.length > 1) part += `:nth-of-type(${sibs.indexOf(cur) + 1})`;
    }
    path.unshift(part);
    cur = parent;
  }
  return path.join(" > ");
}

/**
 * Builds a compact DOM location for agent-readable annotation output.
 *
 * @param {Element} el Target element.
 * @returns {string} Compact path from the page landmark to the target.
 */
function generateElementLocation(el) {
  const path = [];
  let cur = el;

  while (cur && cur !== document.body && cur.nodeType === Node.ELEMENT_NODE) {
    path.unshift(getLocationSegment(cur));
    if (cur.tagName?.toLowerCase() === "main") break;
    cur = cur.parentElement;
  }

  return path.join(" > ");
}

/**
 * Formats one element segment for a compact DOM location.
 *
 * @param {Element} el Target element.
 * @returns {string} Element segment using ID, class, or tag.
 */
function getLocationSegment(el) {
  const tag = el.tagName.toLowerCase();
  if (el.id && /^[a-zA-Z][\w-]*$/.test(el.id)) return `#${el.id}`;
  const className = Array.from(el.classList).find(name => /^[a-zA-Z][\w-]*$/.test(name));
  if (className) return `.${className}`;
  return tag;
}

/**
 * Get all HTML attributes for an element (except class/id which are captured separately)
 * @param {Element} el - Target element
 * @returns {Record<string, string>} Attribute name → value map
 */
function getAttrs(el) {
  const attrs = {};
  for (const attr of el.attributes) {
    // Skip class and id (captured separately)
    if (attr.name === "class" || attr.name === "id") continue;
    // Skip style attribute (too verbose, use computedStyles instead)
    if (attr.name === "style") continue;
    // Truncate long values
    attrs[attr.name] = attr.value.length > 200 ? attr.value.slice(0, 200) + "…" : attr.value;
  }
  return attrs;
}

function createSelectionData(el) {
  const data = {
    element: el,
    selector: generateSelector(el),
    location: generateElementLocation(el),
    tag: el.tagName.toLowerCase(),
    id: el.id || null,
    classes: Array.from(el.classList),
    text: (el.textContent || "").slice(0, TEXT_MAX_LENGTH).trim().replace(/\s+/g, " "),
    rect: getRectData(el),
    attributes: getAttrs(el),
    boxModel: getBoxModel(el),
    accessibility: getAccessibilityInfo(el),
    keyStyles: getKeyStyles(el),
  };
  
  if (debugMode) {
    data.computedStyles = getComputedStyles(el);
    data.parentContext = getParentContext(el);
    data.cssVariables = getCSSVariables(el);
  }
  
  return data;
}

function getRectData(el) {
  const rect = el.getBoundingClientRect();
  return {
    x: Math.round(rect.x + window.scrollX),
    y: Math.round(rect.y + window.scrollY),
    width: Math.round(rect.width),
    height: Math.round(rect.height),
  };
}
