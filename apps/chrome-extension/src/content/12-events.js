// ─────────────────────────────────────────────────────────────────────
// Event Handlers
// ─────────────────────────────────────────────────────────────────────

function onMouseMove(e) {
  if (!isActive || e.target.closest("#nexus-annotation-agent-sidebar") || e.target.closest("#pi-panel") || e.target.closest(".pi-note-card")) {
    hideHighlight();
    hideTooltip();
    return;
  }
  
  highlightEl.style.display = "none";
  tooltipEl.style.display = "none";
  const el = document.elementFromPoint(e.clientX, e.clientY);
  highlightEl.style.display = "";
  
  if (!el || el === document.body || el === document.documentElement || isPiElement(el)) {
    hideHighlight();
    hideTooltip();
    return;
  }
  
  // Build parent chain
  elementStack = [];
  let current = el;
  while (current && current !== document.body && current !== document.documentElement) {
    if (!isPiElement(current)) {
      elementStack.push(current);
    }
    current = current.parentElement;
  }
  stackIndex = 0;
  
  updateHighlight();
  updateTooltip(e.clientX, e.clientY);
}

function onWheel(e) {
  if (!isActive || !elementStack.length || e.target.closest("#nexus-annotation-agent-sidebar") || e.target.closest("#pi-panel") || e.target.closest(".pi-note-card")) return;
  
  if (!e.altKey) return;
  
  e.preventDefault();
  e.stopPropagation();
  
  stackIndex = e.deltaY > 0 
    ? Math.min(stackIndex + 1, elementStack.length - 1)
    : Math.max(stackIndex - 1, 0);
  
  updateHighlight();
  updateTooltip(e.clientX, e.clientY);
}

function onClick(e) {
  if (!isActive || e.target.closest("#nexus-annotation-agent-sidebar") || e.target.closest("#pi-panel") || e.target.closest(".pi-note-card")) return;
  
  e.preventDefault();
  e.stopPropagation();
  
  const el = elementStack[stackIndex];
  if (!el) return;
  
  const idx = selectedElements.findIndex(s => s.element === el);
  
  if (idx >= 0) {
    // Already selected - deselect it
    removeElement(idx);
    return;
  }
  
  // Not selected - add it without clearing existing selections.
  selectElement(el);
  
  // Auto-open note above the clicked point.
  const newIndex = selectedElements.length - 1;
  noteAnchors.set(newIndex, { x: e.clientX, y: e.clientY });
  createNoteCard(newIndex);
  
  updateBadges();
  updateConnectors();
}

function onKeyDown(e) {
  if (!isActive) return;
  if (e.key === "Escape") {
    e.preventDefault();
    const focusedCard = document.activeElement?.closest?.(".pi-note-card");
    if (focusedCard) {
      const index = Number.parseInt(focusedCard.dataset.index, 10);
      const comment = (elementComments.get(index) || "").trim();
      if (!comment && elementResolutionStatus.get(index) !== "submitted") {
        removeElement(index);
        return;
      }
    }
    hideToolbarOnly();
  }
}

function handleScroll() {
  updateBadges();
  updateConnectors();
}

function handleResize() {
  updateBadges();
  const panelHeight = document.getElementById("pi-panel")?.offsetHeight || 96;
  
  openNotes.forEach(index => {
    const card = notesContainer.querySelector(`[data-index="${index}"]`);
    if (!card) return;
    
    const rect = card.getBoundingClientRect();
    const vw = getMainAppRightEdge();
    const vh = window.innerHeight;
    
    let newX = card.offsetLeft;
    let newY = card.offsetTop;
    let moved = false;
    
    if (rect.right > vw - 16) {
      newX = vw - rect.width - 16;
      moved = true;
    }
    if (rect.bottom > vh - panelHeight - 16) {
      newY = vh - rect.height - panelHeight - 16;
      moved = true;
    }
    
    if (moved) {
      card.style.left = `${newX}px`;
      card.style.top = `${newY}px`;
      // Update stored position so rebuild uses correct location
      notePositions.set(index, { x: newX, y: newY });
    }
  });
  updateConnectors();
}
