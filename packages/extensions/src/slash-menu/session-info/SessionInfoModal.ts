import { Key, matchesKey } from "@mariozechner/pi-tui";
import { computeModalWidth, SharedModal, type SelectPreviewTheme } from "@nexus/tui-kit/modal/index.js";
import { renderSessionInfoRows } from "./renderSessionInfoRows.js";

/**
 * Nexus-owned modal for current session info.
 */
export class SessionInfoModal extends SharedModal {
  focused = true;

  constructor(
    private readonly uiTheme: SelectPreviewTheme,
    private readonly rows: string[],
    private readonly closeModal: () => void,
  ) {
    super({ theme: uiTheme, minWidth: 72, maxWidthRatio: 0.9, onClose: closeModal, headerLines: [uiTheme.fg("accent", "● Session")], panes: [] });
  }

  /**
   * Handles close shortcuts.
   *
   * @param data Raw terminal input.
   */
  handleInput(data: string): void {
    if (matchesKey(data, Key.escape) || matchesKey(data, Key.ctrl("c")) || data === "q") {
      this.closeModal();
      return;
    }
    super.handleInput(data);
  }

  /**
   * Renders the session info modal.
   *
   * @param width Available terminal width.
   * @returns Rendered modal rows.
   */
  render(width: number): string[] {
    const dialogWidth = Math.max(1, computeModalWidth(width, 72, 0.9) - 2);
    this.footerHotkeys = [{ key: "Esc/Ctrl+C/q", label: "closes" }];
    this.footerLines = [];
    this.panes = [{ id: "session-info", size: 1, lines: renderSessionInfoRows(this.rows, dialogWidth, this.uiTheme) }];
    return super.render(width);
  }
}
