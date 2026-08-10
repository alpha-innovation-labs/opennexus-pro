import { truncateToWidth, visibleWidth } from "@earendil-works/pi-tui";
import type { SelectPreviewTheme } from "./types";

export type TwoPaneHeaderOptions = {
  activePane: "left" | "right";
  leftTitle: string;
  rightTitle: string;
  showFocusMarkers?: boolean;
  leftWidth?: number;
  rightWidth?: number;
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
  const showFocusMarkers = options.showFocusMarkers ?? true;
  const left = formatHeaderTitle(options.leftTitle, options.activePane === "left", options.uiTheme, showFocusMarkers);
  const right = formatHeaderTitle(options.rightTitle, options.activePane === "right", options.uiTheme, showFocusMarkers);
  if (options.showLeftPane && options.showRightPane && options.rightTitle.trim() === "") return options.leftTitle;
  if (options.showLeftPane && options.showRightPane) {
    if (options.leftWidth !== undefined && options.rightWidth !== undefined) {
      const separator = showFocusMarkers ? options.uiTheme.fg("borderMuted", "│") : " ";
      return `${padRight(left, options.leftWidth)}${separator}${padLeft(right, options.rightWidth)}`;
    }
    return `${left} │ ${right}`;
  }
  return options.showLeftPane ? left : right;
}

/** Formats one header title with optional focus marker. */
function formatHeaderTitle(title: string, active: boolean, theme: SelectPreviewTheme, showFocusMarkers: boolean): string {
  if (!showFocusMarkers) return title;
  return active ? theme.fg("accent", `● ${title}`) : theme.fg("muted", `○ ${title}`);
}

/** Pads visible text to the right. */
function padRight(value: string, width: number): string {
  const text = truncateToWidth(value, Math.max(1, width), "");
  return `${text}${" ".repeat(Math.max(0, width - visibleWidth(text)))}`;
}

/** Pads visible text to the left. */
function padLeft(value: string, width: number): string {
  const text = truncateToWidth(value, Math.max(1, width), "");
  return `${" ".repeat(Math.max(0, width - visibleWidth(text)))}${text}`;
}
