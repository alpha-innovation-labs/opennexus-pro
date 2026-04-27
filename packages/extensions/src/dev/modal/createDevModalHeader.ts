import { renderDevModalTabs } from "./renderDevModalTabs.js";
import type { DevModalTheme, DevModalVariation } from "./types.js";

/**
 * Creates header rows for the dev modal.
 *
 * @param variations Available modal variations.
 * @param selectedIndex Current selected variation index.
 * @param theme Theme color helpers.
 * @returns Header rows containing the variation selector.
 */
export function createDevModalHeader(
  variations: DevModalVariation[],
  selectedIndex: number,
  theme: DevModalTheme,
): string[] {
  return [renderDevModalTabs(variations, selectedIndex, theme, Number.MAX_SAFE_INTEGER)];
}
