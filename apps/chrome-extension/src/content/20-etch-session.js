function startEtchCapture() {
  clearEtchMarkers();
  etchMode = true;
  etchStartTime = Date.now();
  etchInitialRules = serializeAllStylesheets();
  etchStyleInitials.clear();
  etchClassInitials.clear();
  etchAttrInitials.clear();
  etchTextInitials.clear();
  etchChildListMutations = [];
  etchChangeCount = 0;
  updateEtchCounter();

  etchObserver = new MutationObserver((mutations) => {
    processEtchMutations(mutations);
    updateEtchCounter();
  });

  etchObserver.observe(document.documentElement, {
    attributes: true,
    attributeOldValue: true,
    characterData: true,
    characterDataOldValue: true,
    childList: true,
    subtree: true,
  });
}

function stopEtchCapture() {
  if (etchObserver) {
    const pending = etchObserver.takeRecords();
    etchObserver.disconnect();
    if (pending.length) processEtchMutations(pending);
    etchObserver = null;
  }
  etchMode = false;
  updateEtchCounter();
}

function updateEtchCounter() {
  const counter = document.getElementById("pi-etch-count");
  if (!counter) return;
  const text = etchChangeCount > 0 ? `${etchChangeCount}` : "";
  const display = etchChangeCount > 0 ? "inline-flex" : "none";
  if (counter.textContent !== text) counter.textContent = text;
  if (counter.style.display !== display) counter.style.display = display;
}
