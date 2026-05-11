/**
 * Updates one note card with submitted/resolved feedback history.
 *
 * @param {number} index Selected element index.
 */
function updateNoteResolutionCard(index) {
  const card = notesContainer?.querySelector(`[data-index="${index}"]`);
  if (!card) return;
  const statusEl = card.querySelector('[data-role="status"]');
  const doneBtn = card.querySelector('[data-role="done"]');
  const status = elementResolutionStatus.get(index);
  const feedback = elementFeedbackHistory.get(index);
  if (!status || !feedback) {
    statusEl.classList.add("pi-hidden");
    doneBtn.classList.add("pi-hidden");
    return;
  }
  statusEl.classList.remove("pi-hidden");
  statusEl.classList.toggle("resolved", status === "resolved");
  statusEl.textContent = status === "resolved" ? `Resolved: ${feedback}` : `Submitted: ${feedback}`;
  doneBtn.classList.toggle("pi-hidden", status !== "resolved");
}

/**
 * Marks one note card as submitted to the real Nexus chat.
 *
 * @param {number} index Selected element index.
 */
function markNoteSubmitted(index) {
  const feedback = (elementComments.get(index) || "").trim() || "No per-element note.";
  elementFeedbackHistory.set(index, feedback);
  elementResolutionStatus.set(index, "submitted");
  updateNoteResolutionCard(index);
}

/**
 * Marks currently selected note cards as submitted to the real Nexus chat.
 */
function markSelectedNotesSubmitted() {
  selectedElements.forEach((_selection, index) => markNoteSubmitted(index));
}

/**
 * Marks submitted note cards as resolved after the real Nexus chat finishes.
 */
function markAnnotationResolved(annotationId) {
  selectedElements.forEach((_selection, index) => {
    if (elementAnnotationIds.get(index) !== annotationId) return;
    elementResolutionStatus.set(index, "resolved");
    updateNoteResolutionCard(index);
  });
}

/**
 * Creates a serializable annotation element for one selected element.
 *
 * @param {number} index Selected element index.
 * @returns Serialized element payload.
 */
function createSubmittedElement(index) {
  const selection = selectedElements[index];
  if (!selection) return null;
  const { element, ...rest } = selection;
  return { ...rest, comment: elementComments.get(index) || "" };
}

/**
 * Submits one note immediately when live mode is enabled.
 *
 * @param {number} index Selected element index.
 */
async function submitLiveNote(index) {
  const element = createSubmittedElement(index);
  if (!element) return;
  const workspaceDir = document.getElementById("pi-workspace-dir")?.value?.trim() || readWorkspaceDirPreference();
  const prompt = (elementComments.get(index) || "").trim();
  writeWorkspaceDirPreference(workspaceDir);
  markNoteSubmitted(index);
  window.NexusAnnotationSidebar?.show?.();
  const response = await chrome.runtime.sendMessage({
    type: "ANNOTATIONS_COMPLETE",
    requestId,
    result: {
      success: true,
      elements: [element],
      screenshots: [],
      prompt,
      url: window.location.href,
      workspaceDir,
      viewport: { width: window.innerWidth, height: window.innerHeight },
    },
  });
  if (response?.annotation?.id) elementAnnotationIds.set(index, response.annotation.id);
}

function toggleNote(index) {
  if (openNotes.has(index)) {
    // Close note
    const card = notesContainer.querySelector(`[data-index="${index}"]`);
    if (card) card.remove();
    openNotes.delete(index);
  } else {
    // Open note
    createNoteCard(index);
  }
  updateBadges();
  updateConnectors();
}

function autoResizeTextarea(textarea) {
  textarea.style.height = "auto";
  textarea.style.height = Math.min(160, Math.max(72, textarea.scrollHeight)) + "px";
}
