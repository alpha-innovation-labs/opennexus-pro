function formatRuleSelector(rule) {
  return rule.parentRule
    ? `${rule.parentRule} { ${rule.selectorText} }`
    : rule.selectorText;
}

function parseStyleAttribute(str) {
  if (!str) return {};
  const props = {};
  // Use a temporary element to parse reliably
  const tmp = document.createElement("div");
  tmp.style.cssText = str;
  for (let i = 0; i < tmp.style.length; i++) {
    const prop = tmp.style[i];
    props[prop] = tmp.style.getPropertyValue(prop);
  }
  return props;
}

function diffInlineStyles() {
  const changes = [];

  for (const [el, initialValue] of etchStyleInitials) {
    if (!document.contains(el)) continue;
    const currentValue = el.getAttribute("style");
    if (initialValue === currentValue) continue;

    const initial = parseStyleAttribute(initialValue);
    const current = parseStyleAttribute(currentValue);

    const added = {};
    const changed = [];
    const removed = [];

    for (const [prop, value] of Object.entries(current)) {
      if (!(prop in initial)) {
        added[prop] = value;
      } else if (initial[prop] !== value) {
        changed.push({ property: prop, from: initial[prop], to: value });
      }
    }
    for (const prop of Object.keys(initial)) {
      if (!(prop in current)) {
        removed.push(prop);
      }
    }

    if (Object.keys(added).length || changed.length || removed.length) {
      changes.push({
        selector: generateSelector(el),
        tag: el.tagName.toLowerCase(),
        added,
        changed,
        removed,
      });
    }
  }

  return changes;
}
