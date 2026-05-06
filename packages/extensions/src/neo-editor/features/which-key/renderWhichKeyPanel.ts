import type { SelectPreviewTheme } from "@nexus/tui-kit/modal/index.js";
import { padVisible } from "../help-shortcuts/padVisible.js";
import { renderHelpPanelTop } from "../help-shortcuts/renderHelpPanelTop.js";
import type { WhichKeyGroup } from "./types.js";

/**
 * Renders one titled which-key panel.
 *
 * @param uiTheme Active UI theme.
 * @param group Shortcut group to render.
 * @param width Full panel width.
 * @returns Panel lines.
 */
export function renderWhichKeyPanel(uiTheme: SelectPreviewTheme, group: WhichKeyGroup, width: number): string[] {
  const innerWidth = Math.max(1, width - 2);
  const keyWidth = Math.min(30, Math.max(8, Math.floor(innerWidth * 0.45)));
  const labelWidth = Math.max(1, innerWidth - keyWidth);
  const lines = [renderHelpPanelTop(uiTheme, group.title, width)];
  for (const shortcut of group.shortcuts) {
    const label = padVisible(shortcut.label.slice(0, labelWidth), labelWidth);
    const keys = padVisible(uiTheme.fg("success", shortcut.keys.slice(0, keyWidth)), keyWidth);
    lines.push(uiTheme.fg("borderMuted", "│") + label + keys + uiTheme.fg("borderMuted", "│"));
  }
  lines.push(uiTheme.fg("borderMuted", `└${"─".repeat(innerWidth)}┘`));
  return lines;
}
