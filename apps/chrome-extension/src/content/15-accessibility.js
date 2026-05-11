// ARIA role mappings for getImplicitRole (defined once, not per-call)
var INPUT_TYPE_ROLES = {
  button: "button",
  submit: "button",
  reset: "button",
  image: "button",
  checkbox: "checkbox",
  radio: "radio",
  range: "slider",
  number: "spinbutton",
  search: "searchbox",
  email: "textbox",
  tel: "textbox",
  url: "textbox",
  text: "textbox",
  password: "textbox",
};

var TAG_ROLES = {
  article: "article",
  aside: "complementary",
  button: "button",
  datalist: "listbox",
  details: "group",
  dialog: "dialog",
  fieldset: "group",
  figure: "figure",
  footer: "contentinfo",
  form: "form",
  h1: "heading", h2: "heading", h3: "heading",
  h4: "heading", h5: "heading", h6: "heading",
  header: "banner",
  hr: "separator",
  li: "listitem",
  main: "main",
  math: "math",
  menu: "list",
  nav: "navigation",
  ol: "list",
  optgroup: "group",
  option: "option",
  output: "status",
  progress: "progressbar",
  section: "region",
  select: "combobox",
  summary: "button",
  table: "table",
  tbody: "rowgroup",
  td: "cell",
  textarea: "textbox",
  tfoot: "rowgroup",
  th: "columnheader",
  thead: "rowgroup",
  tr: "row",
  ul: "list",
};

/**
 * Get implicit ARIA role for an element based on tag and attributes
 * @param {Element} el - Target element
 * @returns {string|null} Implicit role or null
 */
function getImplicitRole(el) {
  const tag = el.tagName.toLowerCase();
  const type = el.getAttribute("type")?.toLowerCase();
  
  // Special cases
  if (tag === "a") return el.hasAttribute("href") ? "link" : null;
  if (tag === "area") return el.hasAttribute("href") ? "link" : null;
  if (tag === "input") return type ? (INPUT_TYPE_ROLES[type] || "textbox") : "textbox";
  if (tag === "img") {
    const alt = el.getAttribute("alt");
    if (alt === null) return "img";
    if (alt === "") return "presentation";
    return "img";
  }
  
  return TAG_ROLES[tag] || null;
}

/**
 * Check if element can receive keyboard focus
 * @param {Element} el - Target element
 * @returns {boolean}
 */
function isFocusable(el) {
  if (el.hasAttribute("tabindex")) {
    return el.tabIndex >= 0;
  }
  if (el.disabled) return false;
  
  const tag = el.tagName.toLowerCase();
  if (tag === "a" || tag === "area") {
    return el.hasAttribute("href");
  }
  
  return ["button", "input", "select", "textarea"].includes(tag);
}

/**
 * Get computed accessible name for an element
 * @param {Element} el - Target element
 * @returns {string|null}
 */
function getAccessibleName(el) {
  // Priority: aria-labelledby > aria-label > label[for] > title > text content
  const labelledBy = el.getAttribute("aria-labelledby");
  if (labelledBy) {
    const name = labelledBy.split(/\s+/)
      .map(id => document.getElementById(id)?.textContent?.trim())
      .filter(Boolean).join(" ");
    if (name) return name;
  }
  
  const ariaLabel = el.getAttribute("aria-label");
  if (ariaLabel) return ariaLabel;
  
  // For labelable elements, check associated label
  const tag = el.tagName.toLowerCase();
  const labelable = ["input", "select", "textarea", "button", "meter", "progress", "output"];
  if (el.id && labelable.includes(tag)) {
    const label = document.querySelector(`label[for="${CSS.escape(el.id)}"]`);
    if (label) return label.textContent?.trim() || null;
  }
  
  const title = el.getAttribute("title");
  if (title) return title;
  
  // Fallback to text content for interactive elements
  if (["button", "a", "label", "legend", "caption"].includes(tag)) {
    const text = el.textContent?.trim();
    return text ? text.slice(0, 100) : null;
  }
  
  // For img, use alt
  if (tag === "img") {
    return el.getAttribute("alt") || null;
  }
  
  return null;
}

/**
 * Get aria-describedby content
 * @param {Element} el - Target element
 * @returns {string|null}
 */
function getAccessibleDescription(el) {
  const describedBy = el.getAttribute("aria-describedby");
  if (describedBy) {
    return describedBy.split(/\s+/)
      .map(id => document.getElementById(id)?.textContent?.trim())
      .filter(Boolean).join(" ") || null;
  }
  return null;
}

/**
 * Get accessibility information for an element
 * @param {Element} el - Target element
 * @returns {AccessibilityInfo}
 */
function getAccessibilityInfo(el) {
  const role = el.getAttribute("role") || getImplicitRole(el);
  const ariaExpanded = el.getAttribute("aria-expanded");
  const ariaPressed = el.getAttribute("aria-pressed");
  const ariaChecked = el.getAttribute("aria-checked");
  const ariaSelected = el.getAttribute("aria-selected");
  
  const parseAriaBoolean = (val) => val === "true" ? true : val === "false" ? false : undefined;
  
  return {
    role,
    name: getAccessibleName(el),
    description: getAccessibleDescription(el),
    focusable: isFocusable(el),
    disabled: el.disabled === true || el.getAttribute("aria-disabled") === "true",
    expanded: parseAriaBoolean(ariaExpanded),
    pressed: parseAriaBoolean(ariaPressed),
    checked: typeof el.checked === "boolean" ? el.checked : parseAriaBoolean(ariaChecked),
    selected: typeof el.selected === "boolean" ? el.selected : parseAriaBoolean(ariaSelected)
  };
}
