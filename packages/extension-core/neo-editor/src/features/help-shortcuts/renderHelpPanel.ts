import type { SelectPreviewTheme } from "@nexus/tui-kit/modal/index";
import type { HelpShortcutGroup } from "./types";
import { padVisible } from "./padVisible";
import { renderHelpPanelTop } from "./renderHelpPanelTop";
import { renderHelpShortcutRow } from "./renderHelpShortcutRow";

/**
 * Renders one titled shortcut group panel.
 *
 * @param uiTheme Active UI theme.
 * @param group Shortcut group to render.
 * @param width Full panel width.
 * @returns Panel lines.
 */
export function renderHelpPanel(uiTheme: SelectPreviewTheme, group: HelpShortcutGroup, width: number): string[] {
  const innerWidth = Math.max(1, width - 2);
  const lines = [renderHelpPanelTop(uiTheme, group.title, width)];
  for (const shortcut of group.shortcuts) {
    lines.push(uiTheme.fg("borderMuted", "│") + renderHelpShortcutRow(uiTheme, shortcut, innerWidth) + uiTheme.fg("borderMuted", "│"));
  }
  lines.push(uiTheme.fg("borderMuted", `└${"─".repeat(innerWidth)}┘`));
  return lines;
}
