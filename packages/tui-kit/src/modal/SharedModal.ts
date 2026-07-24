import { Key, matchesKey, type Component } from "@earendil-works/pi-tui";
import { centerModalLine } from "./centerModalLine.js";
import { computeModalWidth } from "./computeModalWidth.js";
import { renderFooterRows } from "./renderFooterRows.js";
import { renderFullWidthRows } from "./renderFullWidthRows.js";
import { renderModalBorder } from "./renderModalBorder.js";
import { renderModalBorderWithPaneSeparators } from "./renderModalBorderWithPaneSeparators.js";
import { renderModalPaneBottomBorder } from "./renderModalPaneBottomBorder.js";
import { renderModalPaneFillerRows, renderModalPanes } from "./renderModalPanes.js";
import { renderModalPaneTopBorder } from "./renderModalPaneTopBorder.js";
import { createModalHotkeyFooterSegments } from "./hotkeys/createModalHotkeyFooterSegments.js";
import { wrapModalHotkeyFooterSegments } from "./hotkeys/wrapModalHotkeyFooterSegments.js";
import { getModalWindowRows } from "./scroll/getModalWindowRows.js";
import { handleModalScrollInput } from "./scroll/handleModalScrollInput.js";
import { renderModalWithScrollableBody } from "./scroll/renderModalWithScrollableBody.js";
import type { SharedModalOptions, SharedModalPane, SharedModalTheme } from "./types.js";

/**
 * Shared framed modal with configurable header, footer, and N content panes.
 */
export class SharedModal implements Component {
  protected footerLines: string[];
  protected footerHotkeys: SharedModalOptions["footerHotkeys"];
  protected headerLines: string[];
  protected panes: SharedModalPane[];
  private sharedFullScreen: boolean;
  private readonly fullScreenHotkey: string | false;
  private sharedFullScreenRows?: number | (() => number);
  private sharedHidePaneTopBorder: boolean;
  private maxWidth?: number;
  private maxWidthRatio: number;
  private overflowScrollbar: boolean;
  private minWidth: number;
  private readonly onClose?: () => void;
  private readonly onFullScreenChange?: (enabled: boolean) => void;
  private overflowMaxScrollOffset = 0;
  private overflowPendingGotoStart = false;
  private overflowScrollOffset = 0;
  private overflowVisibleRows = 1;
  protected readonly theme: SharedModalTheme;

  /**
   * Creates a shared modal.
   *
   * @param options Modal configuration.
   */
  constructor(options: SharedModalOptions) {
    this.footerHotkeys = options.footerHotkeys ?? [];
    this.footerLines = options.footerLines ?? [];
    this.sharedFullScreen = options.fullScreen ?? false;
    this.fullScreenHotkey = options.fullScreenHotkey ?? "f";
    this.sharedFullScreenRows = options.fullScreenRows;
    this.sharedHidePaneTopBorder = options.hidePaneTopBorder ?? false;
    this.headerLines = options.headerLines ?? [];
    this.maxWidth = options.maxWidth;
    this.maxWidthRatio = options.maxWidthRatio ?? 0.9;
    this.overflowScrollbar = options.overflowScrollbar ?? true;
    this.minWidth = options.minWidth ?? 80;
    this.onClose = options.onClose;
    this.onFullScreenChange = options.onFullScreenChange;
    this.panes = options.panes;
    this.theme = options.theme;
  }

  /**
   * Handles modal-level close shortcuts.
   *
   * @param data Raw keyboard input.
   */
  handleInput(data: string): void {
    if (matchesKey(data, Key.escape) || matchesKey(data, Key.ctrl("c"))) {
      this.onClose?.();
      return;
    }

    if (this.fullScreenHotkey !== false && data === this.fullScreenHotkey) {
      this.toggleFullScreen();
      return;
    }

    const scrollResult = handleModalScrollInput({
      data,
      maxScrollOffset: this.overflowMaxScrollOffset,
      pendingGotoStart: this.overflowPendingGotoStart,
      scrollOffset: this.overflowScrollOffset,
      visibleRows: this.overflowVisibleRows,
    });
    this.overflowPendingGotoStart = scrollResult.pendingGotoStart;
    this.overflowScrollOffset = scrollResult.scrollOffset;
  }

  /**
   * Updates modal width limits.
   *
   * @param minWidth Minimum desired width.
   * @param maxWidth Maximum desired width.
   * @param maxWidthRatio Maximum terminal-width ratio.
   */
  setWidthPolicy(minWidth: number, maxWidth?: number, maxWidthRatio = this.maxWidthRatio, fullScreen = this.sharedFullScreen, fullScreenRows = this.sharedFullScreenRows): void {
    this.minWidth = minWidth;
    this.maxWidth = maxWidth;
    this.maxWidthRatio = maxWidthRatio;
    this.sharedFullScreen = fullScreen;
    this.sharedFullScreenRows = fullScreenRows;
  }

  /** Hides the pane-top border (the '┬' separator row below the header). */
  setHidePaneTopBorder(hide: boolean): void { this.sharedHidePaneTopBorder = hide; }

  /**
   * Renders the shared modal frame.
   *
   * @param width Available terminal width.
   * @returns Rendered modal lines.
   */
  render(width: number): string[] {
    const computedWidth = this.sharedFullScreen ? width : computeModalWidth(width, this.minWidth, this.maxWidthRatio);
    const modalWidth = this.sharedFullScreen ? width : this.maxWidth === undefined ? computedWidth : Math.min(computedWidth, this.maxWidth, width);
    const innerWidth = Math.max(1, modalWidth - 2);
    const topBorder = this.headerLines.length > 0
      ? renderModalBorder(this.theme, "┌", "─", "┐", innerWidth)
      : renderModalBorderWithPaneSeparators(this.theme, "┌", "─", "┬", "┐", innerWidth, this.panes);
    const topRows = [topBorder];

    if (this.headerLines.length > 0) {
      topRows.push(...renderFullWidthRows(this.theme, this.headerLines, innerWidth));
      if (!this.sharedHidePaneTopBorder) {
        topRows.push(renderModalPaneTopBorder(this.theme, innerWidth, this.panes));
      }
    }

    const bodyRows = renderModalPanes(this.theme, this.panes, innerWidth);
    const shouldShowBaseHotkeys = this.footerHotkeys !== undefined && this.footerHotkeys.length > 0 || bodyRows.length > this.getBodyRowBudget(topRows.length, this.footerLines.length, 1);
    const footerLines = this.getRenderedFooterLines(shouldShowBaseHotkeys, innerWidth);
    const bottomBorder = footerLines.length > 0
      ? renderModalBorder(this.theme, "└", "─", "┘", innerWidth)
      : renderModalBorderWithPaneSeparators(this.theme, "└", "─", "┴", "┘", innerWidth, this.panes);
    const bottomRows = footerLines.length > 0
      ? [this.sharedHidePaneTopBorder ? renderModalBorder(this.theme, "└", "─", "┘", innerWidth) : renderModalPaneBottomBorder(this.theme, innerWidth, this.panes), ...renderFooterRows(this.theme, footerLines, innerWidth), bottomBorder]
      : [bottomBorder];

    if (this.sharedFullScreen) {
      const targetRows = this.getFullScreenRows();
      bodyRows.push(...renderModalPaneFillerRows(this.theme, this.panes, innerWidth, Math.max(0, targetRows - topRows.length - bodyRows.length - bottomRows.length)));
    }

    const visibleRows = this.getVisibleRows(topRows.length + bodyRows.length + bottomRows.length);
    const overflow = renderModalWithScrollableBody(this.theme, topRows, bodyRows, bottomRows, visibleRows, this.overflowScrollOffset, this.overflowScrollbar);
    this.overflowMaxScrollOffset = overflow.maxScrollOffset;
    this.overflowScrollOffset = overflow.scrollOffset;
    this.overflowVisibleRows = overflow.visibleBodyRows;

    return this.sharedFullScreen ? overflow.lines : overflow.lines.map((line) => centerModalLine(line, width));
  }

  /**
   * Toggles full-screen rendering and notifies the owner.
   */
  private toggleFullScreen(): void {
    this.sharedFullScreen = !this.sharedFullScreen;
    this.onFullScreenChange?.(this.sharedFullScreen);
  }

  /**
   * Returns target fullscreen row count.
   *
   * @returns Fullscreen row count.
   */
  private getFullScreenRows(): number {
    if (typeof this.sharedFullScreenRows === "function") return Math.max(1, Math.floor(this.sharedFullScreenRows()));
    if (typeof this.sharedFullScreenRows === "number") return Math.max(1, Math.floor(this.sharedFullScreenRows));
    return getModalWindowRows(40);
  }

  /**
   * Returns the current terminal height available to the modal.
   *
   * @param renderedRows Number of rows produced by the modal before clipping.
   * @returns Visible row budget.
   */
  private getVisibleRows(renderedRows: number): number {
    if (this.sharedFullScreen) return this.getFullScreenRows();
    return getModalWindowRows(renderedRows);
  }

  /**
   * Returns body rows available after fixed modal chrome.
   *
   * @param topRowCount Count of fixed top rows.
   * @param footerLineCount Count of caller-provided footer rows.
   * @param hotkeyFooterLineCount Count of shared hotkey footer rows.
   * @returns Available body row count.
   */
  private getBodyRowBudget(topRowCount: number, footerLineCount: number, hotkeyFooterLineCount: number): number {
    const visibleRows = this.getVisibleRows(topRowCount + footerLineCount + hotkeyFooterLineCount + 2);
    const footerChromeRows = footerLineCount + hotkeyFooterLineCount > 0 ? 2 : 1;
    return Math.max(1, visibleRows - topRowCount - footerLineCount - hotkeyFooterLineCount - footerChromeRows);
  }

  /**
   * Returns footer lines plus the shared hotkey row when needed.
   *
   * @param showBaseHotkeys Whether scroll hotkeys should be displayed.
   * @returns Footer lines rendered at the bottom of the modal.
   */
  private getRenderedFooterLines(showBaseHotkeys: boolean, width: number): string[] {
    const segments = createModalHotkeyFooterSegments(this.theme, this.footerHotkeys ?? [], showBaseHotkeys);
    if (segments.length === 0) return this.footerLines;
    return [...wrapModalHotkeyFooterSegments(this.theme, segments, width), ...this.footerLines];
  }

  /**
   * Clears render caches for theme changes.
   */
  invalidate(): void { return undefined; }
}
