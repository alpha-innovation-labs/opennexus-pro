import { Key, matchesKey, wrapTextWithAnsi } from "@mariozechner/pi-tui";
import { computeModalWidth, SharedModal, type SelectPreviewTheme } from "@nexus/tui-kit/modal/index.js";
import type { ContextUsageReport } from "./types.js";
import { renderThemedContextUsageRows } from "./renderThemedContextUsageRows.js";

/**
 * Shared tui-kit modal for current context usage.
 */
export class ContextUsageModal extends SharedModal {
  focused = true;

  constructor(
    private readonly uiTheme: SelectPreviewTheme,
    private readonly report: ContextUsageReport,
    private readonly closeModal: () => void,
  ) {
    super({
      theme: uiTheme,
      minWidth: 90,
      maxWidthRatio: 0.92,
      fullScreen: true,
      fullScreenRows: () => Math.max(24, process.stdout.rows || 40),
      onClose: closeModal,
      headerLines: [uiTheme.fg("accent", "● Context Usage")],
      panes: [],
    });
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
   * Renders the context usage modal.
   *
   * @param width Available terminal width.
   * @returns Rendered modal rows.
   */
  render(width: number): string[] {
    const dialogWidth = Math.max(1, computeModalWidth(width, 90, 0.92) - 2);
    this.footerHotkeys = [{ key: "Esc/Ctrl+C/q", label: "closes" }];
    this.footerLines = [];
    this.panes = [{ id: "context-usage", size: 1, lines: renderThemedContextUsageRows(this.report, this.uiTheme).flatMap((line) => wrapTextWithAnsi(line, dialogWidth)) }];
    return super.render(width);
  }
}
