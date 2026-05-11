// ─────────────────────────────────────────────────────────────────────
// UI Updates
// ─────────────────────────────────────────────────────────────────────

function updateBadges() {
  if (!markersContainer) return;
  markersContainer.innerHTML = "";
  
  selectedElements.forEach((sel, i) => {
    if (!sel.element || !document.contains(sel.element)) return;
    
    const rect = sel.element.getBoundingClientRect();
    
    // Create outline box around selected element
    const outline = document.createElement("div");
    outline.className = "pi-marker-outline";
    outline.style.left = `${rect.left}px`;
    outline.style.top = `${rect.top}px`;
    outline.style.width = `${rect.width}px`;
    outline.style.height = `${rect.height}px`;
    markersContainer.appendChild(outline);
    
    // Create numbered badge
    const badge = document.createElement("div");
    badge.className = `pi-marker-badge ${openNotes.has(i) ? "open" : ""}`;
    badge.dataset.index = i;
    badge.textContent = i + 1;
    badge.style.left = `${rect.right - 14}px`;
    badge.style.top = `${rect.top - 14}px`;
    
    badge.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleNote(i);
    });
    
    markersContainer.appendChild(badge);
  });
  
  // Update count
  const countEl = document.getElementById("pi-count");
  if (countEl) countEl.textContent = `${selectedElements.length} selected`;
}

function updateConnectors() {
  if (!connectorsEl) return;
  connectorsEl.innerHTML = "";
  
  selectedElements.forEach((sel, i) => {
    if (!openNotes.has(i)) return;
    
    const card = notesContainer.querySelector(`[data-index="${i}"]`);
    if (!card || !sel.element || !document.contains(sel.element)) return;
    
    const elemRect = sel.element.getBoundingClientRect();
    const cardRect = card.getBoundingClientRect();
    
    const elemCenter = {
      x: elemRect.left + elemRect.width / 2,
      y: elemRect.top + elemRect.height / 2
    };
    
    let cardAnchor;
    if (cardRect.left > elemRect.right) {
      cardAnchor = { x: cardRect.left, y: cardRect.top + 20 };
    } else if (cardRect.right < elemRect.left) {
      cardAnchor = { x: cardRect.right, y: cardRect.top + 20 };
    } else if (cardRect.top > elemRect.bottom) {
      cardAnchor = { x: cardRect.left + 20, y: cardRect.top };
    } else if (cardRect.bottom < elemRect.top) {
      cardAnchor = { x: cardRect.left + 20, y: cardRect.bottom };
    } else {
      return; // Card overlaps element
    }
    
    const midX = (elemCenter.x + cardAnchor.x) / 2;
    const midY = (elemCenter.y + cardAnchor.y) / 2;
    
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("class", "pi-connector");
    path.setAttribute("d", `M ${elemCenter.x},${elemCenter.y} Q ${midX},${midY} ${cardAnchor.x},${cardAnchor.y}`);
    connectorsEl.appendChild(path);
    
    const dot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    dot.setAttribute("class", "pi-connector-dot");
    dot.setAttribute("cx", elemCenter.x);
    dot.setAttribute("cy", elemCenter.y);
    dot.setAttribute("r", 4);
    connectorsEl.appendChild(dot);
  });
}

function updateHighlight() {
  const el = elementStack[stackIndex];
  if (!el) return hideHighlight();
  
  const rect = el.getBoundingClientRect();
  Object.assign(highlightEl.style, {
    display: "",
    left: rect.left + "px",
    top: rect.top + "px",
    width: rect.width + "px",
    height: rect.height + "px",
  });
}

function hideHighlight() {
  if (highlightEl) highlightEl.style.display = "none";
}

function updateTooltip(mx, my) {
  const el = elementStack[stackIndex];
  if (!el) return hideTooltip();
  
  const rect = el.getBoundingClientRect();
  const tag = el.tagName.toLowerCase();
  const id = el.id;
  const classes = Array.from(el.classList).slice(0, 3);
  
  let html = `<span class="tag">${escapeHtml(tag)}</span>`;
  if (id) html += `<span class="id">#${escapeHtml(id)}</span>`;
  if (classes.length) html += `<span class="class">.${escapeHtml(classes.join("."))}</span>`;
  html += `<span class="size">${Math.round(rect.width)}×${Math.round(rect.height)}</span>`;
  if (elementStack.length > 1) {
    html += `<span class="hint">${ALT_KEY_LABEL}+▲▼ ${stackIndex + 1}/${elementStack.length}</span>`;
  }
  
  tooltipEl.innerHTML = html;
  tooltipEl.style.display = "";
  
  let tx = mx + 15, ty = my + 15;
  const tr = tooltipEl.getBoundingClientRect();
  if (tx + tr.width > window.innerWidth - 10) tx = mx - tr.width - 10;
  if (ty + tr.height > window.innerHeight - 100) ty = my - tr.height - 10;
  
  tooltipEl.style.left = tx + "px";
  tooltipEl.style.top = ty + "px";
}

function hideTooltip() {
  if (tooltipEl) tooltipEl.style.display = "none";
}
