import type { SharedModalTheme } from "./types";

/**
 * Renders a modal border line.
 *
 * @param theme Theme color helpers.
 * @param left Left border character.
 * @param middle Middle border character.
 * @param right Right border character.
 * @param width Inner modal width.
 * @returns Rendered border line.
 */
export function renderModalBorder(theme: SharedModalTheme, left: string, middle: string, right: string, width: number): string {
  return theme.fg("borderMuted", `${left}${middle.repeat(width)}${right}`);
}
