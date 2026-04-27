import type { DevModalTheme } from "./types.js";

/**
 * Creates footer rows for the dev modal.
 *
 * @param theme Theme color helpers.
 * @returns Footer rows.
 */
export function createDevModalFooter(theme: DevModalTheme): string[] {
  return [theme.fg("muted", "Tab / Shift+Tab switches variations · Esc closes")];
}
