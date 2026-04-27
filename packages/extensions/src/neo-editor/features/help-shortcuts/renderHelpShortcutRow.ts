import type { SelectPreviewTheme } from "@nexus/tui-kit/modal/index.js";
import type { HelpShortcut } from "./types.js";
import { padVisible } from "./padVisible.js";

/**
 * Renders one shortcut row inside a help panel.
 *
 * @param uiTheme Active UI theme.
 * @param shortcut Shortcut record.
 * @param innerWidth Panel inner width.
 * @returns Styled shortcut row.
 */
export function renderHelpShortcutRow(uiTheme: SelectPreviewTheme, shortcut: HelpShortcut, innerWidth: number): string {
  const keyWidth = Math.min(24, Math.max(8, Math.floor(innerWidth * 0.4)));
  const labelWidth = Math.max(1, innerWidth - keyWidth);
  const label = padVisible(uiTheme.fg("dim", shortcut.label.slice(0, labelWidth)), labelWidth);
  const keys = padVisible(uiTheme.fg("accent", shortcut.keys.slice(0, keyWidth)), keyWidth);
  return label + keys;
}
