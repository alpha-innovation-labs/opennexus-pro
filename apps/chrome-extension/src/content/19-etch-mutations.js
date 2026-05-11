// ─────────────────────────────────────────────────────────────────────
// Edit Capture
// ─────────────────────────────────────────────────────────────────────

function processEtchMutations(mutations) {
  for (const m of mutations) {
    if (isPiElement(m.target) || isPiElement(m.target.parentElement)) continue;

    if (m.type === "attributes") {
      if (m.attributeName === "data-pi-changed") continue;

      if (m.attributeName === "style") {
        if (!etchStyleInitials.has(m.target)) {
          etchStyleInitials.set(m.target, m.oldValue);
          etchChangeCount++;
        }
      } else if (m.attributeName === "class") {
        if (!etchClassInitials.has(m.target)) {
          etchClassInitials.set(m.target, m.oldValue);
          etchChangeCount++;
        }
      } else {
        if (!etchAttrInitials.has(m.target)) {
          etchAttrInitials.set(m.target, new Map());
        }
        const attrs = etchAttrInitials.get(m.target);
        if (!attrs.has(m.attributeName)) {
          attrs.set(m.attributeName, m.oldValue);
          etchChangeCount++;
        }
      }
      if (!m.target.hasAttribute("data-pi-changed")) {
        m.target.setAttribute("data-pi-changed", "");
      }
    } else if (m.type === "characterData") {
      if (!etchTextInitials.has(m.target)) {
        etchTextInitials.set(m.target, m.oldValue);
        etchChangeCount++;
      }
      const parent = m.target.parentElement;
      if (parent && !isPiElement(parent) && !parent.hasAttribute("data-pi-changed")) {
        parent.setAttribute("data-pi-changed", "");
      }
    } else if (m.type === "childList") {
      const hasNonPiNodes = [...m.addedNodes, ...m.removedNodes].some(n =>
        n.nodeType !== Node.ELEMENT_NODE || !isPiElement(n)
      );
      if (hasNonPiNodes) {
        etchChildListMutations.push(m);
        etchChangeCount++;
        if (m.target.nodeType === Node.ELEMENT_NODE && !m.target.hasAttribute("data-pi-changed")) {
          m.target.setAttribute("data-pi-changed", "");
        }
      }
    }
  }
}

function clearEtchMarkers() {
  document.querySelectorAll("[data-pi-changed]").forEach(el => el.removeAttribute("data-pi-changed"));
}
