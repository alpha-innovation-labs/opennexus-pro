// ─────────────────────────────────────────────────────────────────────
// Element Management
// ─────────────────────────────────────────────────────────────────────

function removeElement(index) {
  selectedElements.splice(index, 1);
  
  // Close and remove the note card if open
  if (openNotes.has(index)) {
    const card = notesContainer.querySelector(`[data-index="${index}"]`);
    if (card) card.remove();
    openNotes.delete(index);
  }
  
  // Reindex all state Maps and Sets
  const reindexMap = (map) => {
    const newMap = new Map();
    map.forEach((v, k) => {
      if (k < index) newMap.set(k, v);
      else if (k > index) newMap.set(k - 1, v);
    });
    return newMap;
  };
  
  const reindexSet = (set) => {
    const newSet = new Set();
    set.forEach(k => {
      if (k < index) newSet.add(k);
      else if (k > index) newSet.add(k - 1);
    });
    return newSet;
  };
  
  elementScreenshots = reindexMap(elementScreenshots);
  elementComments = reindexMap(elementComments);
  elementFeedbackHistory = reindexMap(elementFeedbackHistory);
  elementResolutionStatus = reindexMap(elementResolutionStatus);
  elementAnnotationIds = reindexMap(elementAnnotationIds);
  noteAnchors = reindexMap(noteAnchors);
  notePositions = reindexMap(notePositions);
  openNotes = reindexSet(openNotes);
  
  // Update data-index attributes on remaining note cards
  notesContainer.querySelectorAll(".pi-note-card").forEach(card => {
    const cardIndex = parseInt(card.dataset.index, 10);
    if (cardIndex > index) {
      const newIndex = cardIndex - 1;
      card.dataset.index = newIndex;
      const badge = card.querySelector(".pi-note-badge");
      if (badge) badge.textContent = newIndex + 1;
    }
  });
  
  updateBadges();
  updateConnectors();
}

function expandElement(index) {
  const sel = selectedElements[index];
  if (!sel?.element || !document.contains(sel.element)) return;
  
  const parent = sel.element.parentElement;
  if (parent && parent !== document.body && parent !== document.documentElement) {
    if (isPiElement(parent)) {
      console.log("[pi-annotate] Cannot expand to pi-annotate UI element");
      return;
    }
    
    console.log("[pi-annotate] Expanding to parent:", parent.tagName);
    selectedElements[index] = createSelectionData(parent);
    updateNoteCardLabel(index);
    updateBadges();
    updateConnectors();
  } else {
    console.log("[pi-annotate] Already at root - no valid parent");
  }
}

function contractElement(index) {
  const sel = selectedElements[index];
  if (!sel?.element || !document.contains(sel.element)) return;
  
  const children = Array.from(sel.element.children).filter(c => 
    c.nodeType === 1 && !isPiElement(c)
  );
  
  if (children.length > 0) {
    console.log("[pi-annotate] Contracting to child:", children[0].tagName);
    selectedElements[index] = createSelectionData(children[0]);
    updateNoteCardLabel(index);
    updateBadges();
    updateConnectors();
  } else {
    console.log("[pi-annotate] No children to contract to");
  }
}

function scrollToElement(element) {
  if (!element || !document.contains(element)) return;
  
  element.scrollIntoView({
    behavior: "smooth",
    block: "center",
    inline: "center"
  });
  
  // Flash highlight effect after scroll
  setTimeout(() => {
    if (!element || !document.contains(element)) return;
    
    const rect = element.getBoundingClientRect();
    highlightEl.style.display = "";
    highlightEl.style.left = rect.left + "px";
    highlightEl.style.top = rect.top + "px";
    highlightEl.style.width = rect.width + "px";
    highlightEl.style.height = rect.height + "px";
    highlightEl.style.transition = "opacity 0.3s";
    highlightEl.style.opacity = "1";
    
    setTimeout(() => {
      highlightEl.style.opacity = "0";
      setTimeout(() => {
        highlightEl.style.display = "none";
        highlightEl.style.transition = "";
        highlightEl.style.opacity = "";
      }, 300);
    }, 500);
  }, 400);
}

function expandAllNotes() {
  selectedElements.forEach((_, i) => {
    if (!openNotes.has(i)) {
      createNoteCard(i);
    }
  });
  updateBadges();
  updateConnectors();
}

function collapseAllNotes() {
  openNotes.forEach(i => {
    const card = notesContainer.querySelector(`[data-index="${i}"]`);
    if (card) card.remove();
  });
  openNotes.clear();
  updateBadges();
  updateConnectors();
}
