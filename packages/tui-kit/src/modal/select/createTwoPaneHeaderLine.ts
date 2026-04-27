import type { SelectPreviewTheme } from "./types.js";

export type TwoPaneHeaderOptions = {
  activePane: "left" | "right";
  leftTitle: string;
  rightTitle: string;
  showLeftPane: boolean;
  showRightPane: boolean;
  uiTheme: SelectPreviewTheme;
};

/**
 * Creates the shared-modal header line for a two-pane selector.
 *
 * @param options Header options.
 * @returns Header line.
 */
export function createTwoPaneHeaderLine(options: TwoPaneHeaderOptions): string {
  const left = options.activePane === "left" ? options.uiTheme.fg("accent", `● ${options.leftTitle}`) : options.uiTheme.fg("muted", `○ ${options.leftTitle}`);
  const right = options.activePane === "right" ? options.uiTheme.fg("accent", `● ${options.rightTitle}`) : options.uiTheme.fg("muted", `○ ${options.rightTitle}`);
  if (options.showLeftPane && options.showRightPane) return `${left} │ ${right}`;
  return options.showLeftPane ? left : right;
}
