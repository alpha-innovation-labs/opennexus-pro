// ─────────────────────────────────────────────────────────────────────
// Submit / Cancel
// ─────────────────────────────────────────────────────────────────────

async function handleSubmit() {
  const context = document.getElementById("pi-context")?.value?.trim() || "";
  const workspaceDir = document.getElementById("pi-workspace-dir")?.value?.trim() || readWorkspaceDirPreference();
  writeWorkspaceDirPreference(workspaceDir);
  
  // Re-capture debug data for all elements if debug mode is on at submit time
  // (handles elements selected before debug was enabled)
  pruneStaleSelections();
  if (debugMode) {
    selectedElements.forEach(sel => {
      if (sel.element && document.contains(sel.element)) {
        sel.computedStyles = getComputedStyles(sel.element);
        sel.parentContext = getParentContext(sel.element);
        sel.cssVariables = getCSSVariables(sel.element);
      }
    });
  }

  const elements = selectedElements.map((sel, i) => {
    const { element, ...rest } = sel;
    return {
      ...rest,
      comment: elementComments.get(i) || ""
    };
  });
  
  // Hide UI for screenshot capture
  hideHighlight();
  hideTooltip();
  if (markersContainer) markersContainer.style.display = "none";
  if (notesContainer) notesContainer.style.display = "none";
  if (connectorsEl) connectorsEl.style.display = "none";
  if (panelEl) panelEl.style.display = "none";
  clearEtchMarkers();
  
  await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
  
  let screenshot = null;
  let screenshots = [];
  
  if (screenshotMode !== "none") {
    try {
      const resp = await chrome.runtime.sendMessage({ type: "CAPTURE_SCREENSHOT" });
      if (resp?.dataUrl) {
        const fullScreenshot = resp.dataUrl;
        
        if (screenshotMode === "full") {
          // Add numbered badges to the full screenshot so elements can be identified
          screenshot = await addBadgesToScreenshot(fullScreenshot, selectedElements);
        } else {
          for (let i = 0; i < selectedElements.length; i++) {
            const hasScreenshot = elementScreenshots.get(i) !== false;
            const element = selectedElements[i].element;
            if (hasScreenshot && element && document.contains(element)) {
              const cropped = await cropToElement(fullScreenshot, element);
              screenshots.push({ index: i + 1, dataUrl: cropped });
            }
          }
        }
      }
    } catch (err) {
      console.error("[pi-annotate] Screenshot failed:", err);
    }
  }

  // Edit capture
  let editCapture = null;
  if (etchStartTime) {
    // Disconnect observer first — must happen regardless of errors below
    stopEtchCapture();

    try {
      const inlineStyles = diffInlineStyles();
      const currentRulesSnapshot = serializeAllStylesheets();
      const rules = etchInitialRules ? diffStylesheetRules(etchInitialRules, currentRulesSnapshot) : [];
      const dom = compileDOMChanges();
      const changeCount = inlineStyles.length + rules.length + dom.length;
      const warnings = [];

      if (etchInitialRules?.crossOriginCount > 0) {
        warnings.push(`${etchInitialRules.crossOriginCount} cross-origin stylesheet(s) could not be tracked`);
      }

      let beforeScreenshot = null;
      let afterScreenshot = null;

      if (changeCount > 0) {
        // UI is already hidden from the annotation screenshot step above
        const shots = await captureBeforeAfterScreenshots();
        beforeScreenshot = shots.beforeScreenshot;
        afterScreenshot = shots.afterScreenshot;
      }

      editCapture = {
        inlineStyles,
        rules,
        dom,
        beforeScreenshot,
        afterScreenshot,
        duration: Date.now() - etchStartTime,
        changeCount,
        warnings: warnings.length > 0 ? warnings : undefined,
      };
    } catch (err) {
      console.error("[pi-annotate] Edit capture failed:", err);
    }
  }
  
  if (markersContainer) markersContainer.style.display = "";
  if (notesContainer) notesContainer.style.display = "";
  if (connectorsEl) connectorsEl.style.display = "";
  if (panelEl) panelEl.style.display = "";
  updateBadges();
  updateConnectors();

  const response = await chrome.runtime.sendMessage({
    type: "ANNOTATIONS_COMPLETE",
    requestId,
    result: {
      success: true,
      elements,
      screenshot,
      screenshots,
      prompt: context,
      url: window.location.href,
      workspaceDir,
      viewport: { width: window.innerWidth, height: window.innerHeight },
      editCapture,
    },
  });

  markSelectedNotesSubmitted();
  if (response?.annotation?.id) {
    selectedElements.forEach((_selection, index) => elementAnnotationIds.set(index, response.annotation.id));
  }
  window.NexusAnnotationSidebar?.show?.();
}

/**
 * Hides the bottom toolbar while keeping selected notes and annotation state.
 */
function hideToolbarOnly() {
  if (panelEl) panelEl.style.display = "none";
  showLauncher();
}

/**
 * Hides active annotation controls without cancelling or submitting the session.
 */
function hideActiveAnnotationPanel() {
  hideToolbarOnly();
}

function handleCancel() {
  const id = requestId;
  deactivate();
  
  try {
    chrome.runtime.sendMessage({
      type: "CANCEL",
      requestId: id,
      reason: "user",
    });
  } catch (e) {
    console.log("[pi-annotate] Could not send cancel (no connection)");
  }
}
