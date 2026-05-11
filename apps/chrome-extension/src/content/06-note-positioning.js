// ─────────────────────────────────────────────────────────────────────
// Note Card Functions
// ─────────────────────────────────────────────────────────────────────

function getMainAppRightEdge() {
  const sidebarOffset = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--nexus-annotation-sidebar-offset")) || 0;
  return window.innerWidth - sidebarOffset;
}

function calculateNotePosition(element, cardWidth = 280, cardHeight = 150, anchor = null) {
  const rect = element.getBoundingClientRect();
  const vw = getMainAppRightEdge();
  const vh = window.innerHeight;
  const panelHeight = document.getElementById("pi-panel")?.offsetHeight || 96;
  const margin = 16;
  const xAnchor = anchor?.x ?? Math.min(Math.max(rect.left, margin), vw - margin);
  const yAnchor = anchor?.y ?? rect.top;
  const x = Math.max(margin, Math.min(xAnchor - cardWidth / 2, vw - cardWidth - margin));
  const yAbove = yAnchor - cardHeight - margin;
  const yBelow = yAnchor + margin;
  const y = yAbove > margin ? yAbove : Math.min(yBelow, vh - panelHeight - cardHeight - margin);
  return { x, y: Math.max(margin, y) };
}

function hasOverlap(rect1, rect2, margin = 8) {
  return !(
    rect1.right + margin < rect2.left ||
    rect1.left > rect2.right + margin ||
    rect1.bottom + margin < rect2.top ||
    rect1.top > rect2.bottom + margin
  );
}

function adjustForCollisions(position, cardSize, existingCards) {
  const myRect = {
    left: position.x,
    top: position.y,
    right: position.x + cardSize.width,
    bottom: position.y + cardSize.height
  };
  
  let adjusted = { ...position };
  let attempts = 0;
  
  while (attempts < 10) {
    let collision = false;
    
    for (const card of existingCards) {
      const cardRect = card.getBoundingClientRect();
      if (hasOverlap(myRect, cardRect)) {
        adjusted.y = cardRect.bottom + 12;
        myRect.top = adjusted.y;
        myRect.bottom = adjusted.y + cardSize.height;
        collision = true;
        break;
      }
    }
    
    if (!collision) break;
    attempts++;
  }
  
  // Clamp to main app area, excluding the Nexus agent sidebar.
  const vw = getMainAppRightEdge();
  const vh = window.innerHeight;
  const panelHeight = document.getElementById("pi-panel")?.offsetHeight || 96;
  adjusted.x = Math.max(16, Math.min(adjusted.x, vw - cardSize.width - 16));
  adjusted.y = Math.max(16, Math.min(adjusted.y, vh - cardSize.height - panelHeight - 16));
  
  return adjusted;
}
