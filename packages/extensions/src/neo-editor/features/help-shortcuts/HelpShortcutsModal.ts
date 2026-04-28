import { Key, matchesKey } from "@mariozechner/pi-tui";
import { computeModalWidth, SharedModal, type SelectPreviewTheme } from "@nexus/tui-kit/modal/index.js";
import { arrangeHelpGroups } from "./arrangeHelpGroups.js";
import { getHelpShortcutGroups } from "./getHelpShortcutGroups.js";
import { padVisible } from "./padVisible.js";
import { renderHelpPanel } from "./renderHelpPanel.js";

/**
 * Modal that shows grouped Neo keyboard shortcuts.
 */
export class HelpShortcutsModal extends SharedModal {
  focused = true;

  constructor(
    private readonly uiTheme: SelectPreviewTheme,
    onClose: () => void,
  ) {
    super({ theme: uiTheme, minWidth: 60, maxWidthRatio: 0.9, onClose, headerLines: [uiTheme.fg("accent", "● Hotkeys")], panes: [] });
    this.closeModal = onClose;
  }

  private readonly closeModal: () => void;

  /**
   * Handles close shortcuts for the help modal.
   *
   * @param data Raw terminal input.
   */
  handleInput(data: string): void {
    if (matchesKey(data, Key.escape) || matchesKey(data, Key.ctrl("c")) || data === "q") {
      this.closeModal();
    }
  }

  /**
   * Renders grouped shortcut panels.
   *
   * @param width Available terminal width.
   * @returns Rendered modal lines.
   */
  render(width: number): string[] {
    const dialogWidth = Math.max(1, computeModalWidth(width, 60, 0.9) - 2);
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

    this.footerLines = [this.uiTheme.fg("dim", "Tab navigate · Esc/Ctrl+C/q closes")];
    this.panes = [{ id: "hotkeys", size: 1, lines }];
    return super.render(width);
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
