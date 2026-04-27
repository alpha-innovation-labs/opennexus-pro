import { truncateToWidth } from "@mariozechner/pi-tui";
import { formatDevModalTab } from "./formatDevModalTab.js";
import type { DevModalTheme, DevModalVariation } from "./types.js";

/**
 * Renders the top variation selector line.
 *
 * @param variations Available modal variations.
 * @param selectedIndex Current selected index.
 * @param theme Theme color helpers.
 * @param width Maximum render width.
 * @returns One-line tab selector.
 */
export function renderDevModalTabs(
  variations: DevModalVariation[],
  selectedIndex: number,
  theme: DevModalTheme,
  width: number,
): string {
  const tabs = variations.map((variation, index) => formatDevModalTab(variation.label, index === selectedIndex, theme));
  return truncateToWidth(` ${tabs.join(" │ ")}`, width);
}
