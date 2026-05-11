function compileDOMChanges() {
  const changes = [];

  // Class changes
  for (const [el, initialValue] of etchClassInitials) {
    if (!document.contains(el)) continue;
    const currentValue = el.getAttribute("class");
    if (initialValue === currentValue) continue;

    const initialClasses = (initialValue || "").split(/\s+/).filter(Boolean);
    const currentClasses = (currentValue || "").split(/\s+/).filter(Boolean);
    const added = currentClasses.filter(c => !initialClasses.includes(c));
    const removed = initialClasses.filter(c => !currentClasses.includes(c));

    if (added.length || removed.length) {
      const parts = [];
      if (added.length) parts.push(`added: ${added.join(", ")}`);
      if (removed.length) parts.push(`removed: ${removed.join(", ")}`);
      changes.push({
        type: "attribute",
        selector: generateSelector(el),
        detail: `class ${parts.join("; ")}`,
      });
    }
  }

  // Other attribute changes (non-style, non-class: data-*, aria-*, href, src, etc.)
  for (const [el, attrs] of etchAttrInitials) {
    if (!document.contains(el)) continue;
    for (const [attrName, initialValue] of attrs) {
      const currentValue = el.getAttribute(attrName);
      if (initialValue === currentValue) continue;
      const truncate = (s) => s && s.length > 80 ? s.slice(0, 80) + "..." : (s || "");
      if (currentValue === null) {
        changes.push({
          type: "attribute",
          selector: generateSelector(el),
          detail: `${attrName} removed (was "${truncate(initialValue)}")`,
        });
      } else if (initialValue === null) {
        changes.push({
          type: "attribute",
          selector: generateSelector(el),
          detail: `${attrName} added: "${truncate(currentValue)}"`,
        });
      } else {
        changes.push({
          type: "attribute",
          selector: generateSelector(el),
          detail: `${attrName}: "${truncate(initialValue)}" → "${truncate(currentValue)}"`,
        });
      }
    }
  }

  // Text changes
  for (const [node, initialValue] of etchTextInitials) {
    if (!document.contains(node)) continue;
    const currentValue = node.data || node.textContent;
    if (initialValue === currentValue) continue;

    const parent = node.parentElement;
    if (!parent || isPiElement(parent)) continue;

    const truncate = (s) => s && s.length > 80 ? s.slice(0, 80) + "..." : s;
    changes.push({
      type: "text",
      selector: generateSelector(parent),
      detail: `"${truncate(initialValue)}" → "${truncate(currentValue)}"`,
    });
  }

  // Structural changes (deduplicated by parent)
  const structuralParents = new Set();
  for (const m of etchChildListMutations) {
    if (isPiElement(m.target)) continue;
    if (!document.contains(m.target)) continue;
    structuralParents.add(m.target);
  }
  for (const parent of structuralParents) {
    changes.push({
      type: "structural",
      selector: generateSelector(parent),
      detail: "DOM structure modified (children added/removed)",
    });
  }

  return changes;
}
