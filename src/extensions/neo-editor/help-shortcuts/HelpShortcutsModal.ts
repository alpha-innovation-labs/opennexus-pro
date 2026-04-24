import { Container, Key, matchesKey } from "@mariozechner/pi-tui";
import type { UITheme } from "../../shared/two-pane-select-modal/index.js";
import { arrangeHelpGroups } from "./arrangeHelpGroups.js";
import { getHelpShortcutGroups } from "./getHelpShortcutGroups.js";
import { padVisible } from "./padVisible.js";
import { renderHelpPanel } from "./renderHelpPanel.js";

/**
 * Modal that shows grouped Neo keyboard shortcuts.
 */
export class HelpShortcutsModal extends Container {
  focused = true;

  constructor(
    private readonly uiTheme: UITheme,
    private readonly onClose: () => void,
  ) {
    super();
  }

  /**
   * Handles close shortcuts for the help modal.
   *
   * @param data Raw terminal input.
   */
  handleInput(data: string): void {
    if (matchesKey(data, Key.escape) || matchesKey(data, Key.ctrl("c")) || data === "q") {
      this.onClose();
    }
  }

  /**
   * Renders grouped shortcut panels.
   *
   * @param width Available terminal width.
   * @returns Rendered modal lines.
   */
  render(width: number): string[] {
    const dialogWidth = Math.max(60, Math.min(width, Math.floor(width * 0.9)));
    const gap = 2;
    const columnWidth = Math.floor((dialogWidth - gap) / 2);
    const [leftGroups, rightGroups] = arrangeHelpGroups(getHelpShortcutGroups());
    const leftLines = this.renderColumn(leftGroups, columnWidth);
    const rightLines = this.renderColumn(rightGroups, dialogWidth - columnWidth - gap);
    const height = Math.max(leftLines.length, rightLines.length);
    const lines: string[] = [];

    for (let index = 0; index < height; index += 1) {
      lines.push(padVisible(leftLines[index] ?? "", columnWidth) + " ".repeat(gap) + padVisible(rightLines[index] ?? "", dialogWidth - columnWidth - gap));
    }

    lines.push(this.uiTheme.fg("dim", "Esc/Ctrl+C/q closes"));
    return lines;
  }

  /**
   * Renders one column of shortcut panels.
   *
   * @param groups Groups assigned to the column.
   * @param width Column width.
   * @returns Rendered column lines.
   */
  private renderColumn(groups: ReturnType<typeof getHelpShortcutGroups>, width: number): string[] {
    return groups.flatMap((group, index) => [
      ...(index === 0 ? [] : [""]),
      ...renderHelpPanel(this.uiTheme, group, width),
    ]);
  }
}
