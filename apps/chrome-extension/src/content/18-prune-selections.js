function pruneStaleSelections() {
  if (!selectedElements.length) return;
  
  const nextSelections = [];
  const nextScreenshots = new Map();
  const nextComments = new Map();
  const nextFeedbackHistory = new Map();
  const nextResolutionStatus = new Map();
  const nextAnnotationIds = new Map();
  const nextAnchors = new Map();
  const nextPositions = new Map();
  const nextOpenNotes = new Set();
  
  selectedElements.forEach((sel, i) => {
    if (sel?.element && document.contains(sel.element)) {
      const nextIndex = nextSelections.length;
      nextSelections.push(sel);
      
      if (elementScreenshots.has(i)) {
        nextScreenshots.set(nextIndex, elementScreenshots.get(i));
      }
      if (elementComments.has(i)) {
        nextComments.set(nextIndex, elementComments.get(i));
      }
      if (elementFeedbackHistory.has(i)) {
        nextFeedbackHistory.set(nextIndex, elementFeedbackHistory.get(i));
      }
      if (elementResolutionStatus.has(i)) {
        nextResolutionStatus.set(nextIndex, elementResolutionStatus.get(i));
      }
      if (elementAnnotationIds.has(i)) {
        nextAnnotationIds.set(nextIndex, elementAnnotationIds.get(i));
      }
      if (noteAnchors.has(i)) {
        nextAnchors.set(nextIndex, noteAnchors.get(i));
      }
      if (notePositions.has(i)) {
        nextPositions.set(nextIndex, notePositions.get(i));
      }
      if (openNotes.has(i)) {
        nextOpenNotes.add(nextIndex);
      }
    } else if (openNotes.has(i)) {
      const card = notesContainer?.querySelector(`[data-index="${i}"]`);
      if (card) card.remove();
    }
  });
  
  if (nextSelections.length !== selectedElements.length) {
    selectedElements = nextSelections;
    elementScreenshots = nextScreenshots;
    elementComments = nextComments;
    elementFeedbackHistory = nextFeedbackHistory;
    elementResolutionStatus = nextResolutionStatus;
    elementAnnotationIds = nextAnnotationIds;
    noteAnchors = nextAnchors;
    notePositions = nextPositions;
    
    notesContainer.innerHTML = "";
    openNotes = new Set();
    nextOpenNotes.forEach(i => createNoteCard(i));
    
    updateBadges();
    updateConnectors();
  }
}
