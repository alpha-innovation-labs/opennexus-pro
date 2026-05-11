// ─────────────────────────────────────────────────────────────────────
// Drag Handling
// ─────────────────────────────────────────────────────────────────────

function initDragHandlers() {
  document.addEventListener("mousemove", handleDragMove);
  document.addEventListener("mouseup", handleDragEnd);
}

function cleanupDragHandlers() {
  document.removeEventListener("mousemove", handleDragMove);
  document.removeEventListener("mouseup", handleDragEnd);
}

function handleDragMove(e) {
  if (!dragState) return;
  const { card, startX, startY, startLeft, startTop } = dragState;
  const dx = e.clientX - startX;
  const dy = e.clientY - startY;
  const newX = startLeft + dx;
  const newY = startTop + dy;
  card.style.left = `${newX}px`;
  card.style.top = `${newY}px`;
  const index = parseInt(card.dataset.index, 10);
  notePositions.set(index, { x: newX, y: newY });
  updateConnectors();
}

function handleDragEnd() {
  if (dragState) {
    dragState.card.classList.remove("dragging");
    dragState = null;
  }
}

function setupDrag(card) {
  const header = card.querySelector(".pi-note-header");
  
  header.addEventListener("mousedown", (e) => {
    if (e.target.tagName === "BUTTON" || e.target.tagName === "SPAN") return;
    dragState = {
      card,
      startX: e.clientX,
      startY: e.clientY,
      startLeft: card.offsetLeft,
      startTop: card.offsetTop
    };
    card.classList.add("dragging");
    e.preventDefault();
  });
}
