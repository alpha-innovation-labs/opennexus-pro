import { requestContentScript } from "./content-injection.js";
import { getActiveAnnotationTab } from "./tab-actions.js";

/**
 * Toggles annotation picker on the active tab.
 *
 * @returns {Promise<object>} Launcher state.
 */
export async function togglePicker() {
  try {
    const tab = await getActiveAnnotationTab();
    if (!tab?.id) {
      console.log("[pi-annotate] Cannot toggle picker: no valid tab");
      return { available: false, visible: false, expanded: false, active: false };
    }
    return await requestContentScript(tab.id, { type: "TOGGLE_PICKER" });
  } catch (err) {
    console.error("[pi-annotate] Toggle picker failed:", err);
    return { available: false, visible: false, expanded: false, active: false, error: err?.message };
  }
}

/**
 * Reads the current launcher state from the active tab.
 *
 * @returns {Promise<unknown>} Launcher state response.
 */
export async function getLauncherState() {
  try {
    const tab = await getActiveAnnotationTab();
    if (!tab?.id) return { available: false, visible: false, expanded: false, active: false };
    return await requestContentScript(tab.id, { type: "GET_LAUNCHER_STATE" });
  } catch (err) {
    return { available: false, visible: false, expanded: false, active: false, error: err?.message };
  }
}
