async function captureBeforeAfterScreenshots() {
  clearEtchMarkers();

  const afterResp = await chrome.runtime.sendMessage({ type: "CAPTURE_SCREENSHOT" });
  const afterScreenshot = afterResp?.dataUrl || null;

  // Record final values for redo
  const finalStyles = new Map();
  const finalClasses = new Map();
  for (const [el] of etchStyleInitials) {
    finalStyles.set(el, el.getAttribute("style"));
  }
  for (const [el] of etchClassInitials) {
    finalClasses.set(el, el.getAttribute("class"));
  }
  const currentRulesSnapshot = serializeAllStylesheets();

  // Inject transition/animation killer to prevent visual artifacts
  const transitionKiller = document.createElement("style");
  transitionKiller.id = "pi-etch-transition-killer";
  transitionKiller.textContent = "*, *::before, *::after { transition: none !important; animation: none !important; }";
  (document.head || document.documentElement).appendChild(transitionKiller);

  let beforeScreenshot = null;

  try {
    // UNDO: restore initial visual state
    for (const [el, initial] of etchStyleInitials) {
      if (!document.contains(el)) continue;
      if (initial === null) el.removeAttribute("style");
      else el.setAttribute("style", initial);
    }
    for (const [el, initial] of etchClassInitials) {
      if (!document.contains(el)) continue;
      if (initial === null) el.removeAttribute("class");
      else el.setAttribute("class", initial);
    }
    restoreStylesheetRules(etchInitialRules);

    // Force repaint: double-rAF guarantees at least one paint
    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));

    // Capture "before" screenshot (page in original visual state)
    const beforeResp = await chrome.runtime.sendMessage({ type: "CAPTURE_SCREENSHOT" });
    beforeScreenshot = beforeResp?.dataUrl || null;
  } finally {
    // REDO: always restore modified visual state, even if before screenshot failed.
    // Prevents leaving the page in the undone state with user's edits lost.
    for (const [el, final] of finalStyles) {
      if (!document.contains(el)) continue;
      if (final === null) el.removeAttribute("style");
      else el.setAttribute("style", final);
    }
    for (const [el, final] of finalClasses) {
      if (!document.contains(el)) continue;
      if (final === null) el.removeAttribute("class");
      else el.setAttribute("class", final);
    }
    restoreStylesheetRules(currentRulesSnapshot);

    // Always clean up transition killer
    transitionKiller.remove();

    // Force repaint to restore visual state
    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
  }

  return { beforeScreenshot, afterScreenshot };
}

function restoreStylesheetRules(snapshot) {
  if (!snapshot?.sheets) return;

  // Build lookup from ownerNode → rule texts array
  const rulesByNode = new Map();
  for (const entry of snapshot.sheets) {
    rulesByNode.set(entry.ownerNode, entry.ruleTexts);
  }

  for (let si = 0; si < document.styleSheets.length; si++) {
    const sheet = document.styleSheets[si];
    // Skip sheets not in the snapshot (added by JS after recording started, or pi-annotate's own)
    if (!rulesByNode.has(sheet.ownerNode)) continue;

    try {
      const ruleTexts = rulesByNode.get(sheet.ownerNode);

      // Clear current rules
      while (sheet.cssRules.length > 0) {
        sheet.deleteRule(0);
      }
      // Re-insert each original rule directly (no parsing needed)
      for (const ruleStr of ruleTexts) {
        try {
          sheet.insertRule(ruleStr, sheet.cssRules.length);
        } catch (e) {
          // Rule might be invalid in current context, skip
        }
      }
    } catch (e) {
      // Cross-origin, skip
    }
  }
}
