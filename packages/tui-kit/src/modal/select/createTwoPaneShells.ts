import type { SharedModalPane } from "../types.js";

export type TwoPaneShell = Omit<SharedModalPane, "lines">;

export type TwoPaneShellOptions = {
  activePane: "left" | "right";
  innerWidth: number;
  leftPaneMaxWidth?: number;
  leftPaneRatio?: number;
  showLeftPane: boolean;
  showRightPane: boolean;
};

/**
 * Creates width shells for the visible two-pane selector panes.
 *
 * @param options Shell options.
 * @returns Pane shells.
 */
export function createTwoPaneShells(options: TwoPaneShellOptions): TwoPaneShell[] {
  if (options.showLeftPane && options.showRightPane) {
    const ratio = Math.max(0.1, Math.min(0.9, options.leftPaneRatio ?? (options.activePane === "left" ? 0.6 : 0.3)));
    return [
      { id: "left", size: Math.round(ratio * 100), minWidth: Math.min(options.leftPaneMaxWidth ?? 1, options.innerWidth) },
      { id: "right", size: Math.round((1 - ratio) * 100), minWidth: 1 },
    ];
  }
  return [{ id: options.showLeftPane ? "left" : "right", size: 1, minWidth: 1 }];
}
