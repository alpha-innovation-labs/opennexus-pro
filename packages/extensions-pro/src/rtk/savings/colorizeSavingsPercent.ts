import type { SharedModalTheme } from "@nexus/tui-kit/modal/index.js";

/**
 * Applies emphasis color to RTK savings percentages.
 *
 * @param theme Active UI theme.
 * @param value Percent text.
 * @returns Colorized percent text.
 */
export function colorizeSavingsPercent(theme: SharedModalTheme, value: string): string {
  return theme.fg("success", value);
}
