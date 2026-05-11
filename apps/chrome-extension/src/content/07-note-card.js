function createNoteCard(index) {
  const sel = selectedElements[index];
  if (!sel || !sel.element || !document.contains(sel.element)) return null;
  
  // Guard against duplicate cards
  if (openNotes.has(index)) {
    return notesContainer.querySelector(`[data-index="${index}"]`);
  }
  
  // Use stored position if user previously dragged, otherwise calculate
  let adjustedPos;
  if (notePositions.has(index)) {
    adjustedPos = notePositions.get(index);
  } else {
    const position = calculateNotePosition(sel.element, 280, 150, noteAnchors.get(index));
    adjustedPos = adjustForCollisions(
      position,
      { width: 280, height: 150 },
      notesContainer.querySelectorAll(".pi-note-card")
    );
  }
  
  const label = sel.id ? `#${sel.id}` : `${sel.tag}${sel.classes[0] ? "." + sel.classes[0] : ""}`;
  const hasScreenshot = elementScreenshots.get(index) !== false;
  const comment = elementComments.get(index) || "";
  
  const card = document.createElement("div");
  card.className = "pi-note-card";
  card.dataset.index = index;
  card.style.left = `${adjustedPos.x}px`;
  card.style.top = `${adjustedPos.y}px`;
  
  card.innerHTML = `
    <div class="pi-note-header">
      <span class="pi-note-badge">${index + 1}</span>
      <span class="pi-note-selector" title="${escapeHtml(sel.selector)}">${escapeHtml(label)}</span>
      <button class="pi-note-close" title="Remove element">×</button>
    </div>
    <div class="pi-note-body">
      <textarea class="pi-note-textarea" placeholder="Describe changes for this element...">${escapeHtml(comment)}</textarea>
      <div class="pi-note-status pi-hidden" data-role="status"></div>
      <button class="pi-note-done pi-hidden" data-role="done">✓ Mark done</button>
    </div>
  `;
  
  // Helper to get current index from DOM (survives reindexing)
  const getIndex = () => parseInt(card.dataset.index, 10);
  
  // Event listeners
  const textarea = card.querySelector(".pi-note-textarea");
  textarea.addEventListener("input", () => {
    elementComments.set(getIndex(), textarea.value);
    autoResizeTextarea(textarea);
  });
  textarea.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" || event.shiftKey || event.isComposing) return;
    event.preventDefault();
    event.stopPropagation();
    elementComments.set(getIndex(), textarea.value);
    if (liveMode) void submitLiveNote(getIndex());
    textarea.blur();
  });
  
  const doneBtn = card.querySelector('[data-role="done"]');
  doneBtn.addEventListener("click", () => removeElement(getIndex()));

  const closeBtn = card.querySelector(".pi-note-close");
  closeBtn.addEventListener("click", () => removeElement(getIndex()));
  
  const selectorEl = card.querySelector(".pi-note-selector");
  selectorEl.addEventListener("click", () => {
    const idx = getIndex();
    const currentSel = selectedElements[idx];
    if (currentSel?.element) scrollToElement(currentSel.element);
  });
  
  // Drag to reposition
  setupDrag(card);
  
  notesContainer.appendChild(card);
  openNotes.add(index);
  
  updateNoteResolutionCard(index);

  // Focus textarea
  textarea.focus();
  
  return card;
}
