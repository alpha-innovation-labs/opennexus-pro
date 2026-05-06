import { Key, matchesKey, type Component } from "@mariozechner/pi-tui";
import { centerModalLine } from "./centerModalLine.js";
import { computeModalWidth } from "./computeModalWidth.js";
import { createEmptyModalRows } from "./createEmptyModalRows.js";
import { renderFooterRows } from "./renderFooterRows.js";
import { renderFullWidthRows } from "./renderFullWidthRows.js";
import { renderModalBorder } from "./renderModalBorder.js";
import { renderModalPanes } from "./renderModalPanes.js";
import type { SharedModalOptions, SharedModalPane, SharedModalTheme } from "./types.js";

/**
 * Shared framed modal with configurable header, footer, and N content panes.
 */
export class SharedModal implements Component {
  protected footerLines: string[];
  protected headerLines: string[];
  protected panes: SharedModalPane[];
  private fullScreen: boolean;
  private fullScreenRows?: number | (() => number);
  private maxWidth?: number;
  private maxWidthRatio: number;
  private minWidth: number;
  private readonly onClose?: () => void;
  protected readonly theme: SharedModalTheme;

  /**
   * Creates a shared modal.
   *
   * @param options Modal configuration.
   */
  constructor(options: SharedModalOptions) {
    this.footerLines = options.footerLines ?? [];
    this.fullScreen = options.fullScreen ?? false;
    this.fullScreenRows = options.fullScreenRows;
    this.headerLines = options.headerLines ?? [];
    this.maxWidth = options.maxWidth;
    this.maxWidthRatio = options.maxWidthRatio ?? 0.9;
    this.minWidth = options.minWidth ?? 80;
    this.onClose = options.onClose;
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
    }
  }

  /**
   * Updates modal width limits.
   *
   * @param minWidth Minimum desired width.
   * @param maxWidth Maximum desired width.
   * @param maxWidthRatio Maximum terminal-width ratio.
   */
  setWidthPolicy(minWidth: number, maxWidth?: number, maxWidthRatio = this.maxWidthRatio, fullScreen = this.fullScreen, fullScreenRows = this.fullScreenRows): void {
    this.minWidth = minWidth;
    this.maxWidth = maxWidth;
    this.maxWidthRatio = maxWidthRatio;
    this.fullScreen = fullScreen;
    this.fullScreenRows = fullScreenRows;
  }

  /**
   * Renders the shared modal frame.
   *
   * @param width Available terminal width.
   * @returns Rendered modal lines.
   */
  render(width: number): string[] {
    const computedWidth = this.fullScreen ? width : computeModalWidth(width, this.minWidth, this.maxWidthRatio);
    const modalWidth = this.fullScreen ? width : this.maxWidth === undefined ? computedWidth : Math.min(computedWidth, this.maxWidth, width);
    const innerWidth = Math.max(1, modalWidth - 2);
    const lines = [renderModalBorder(this.theme, "┌", "─", "┐", innerWidth)];

    if (this.headerLines.length > 0) {
      lines.push(...renderFullWidthRows(this.theme, this.headerLines, innerWidth));
      lines.push(renderModalBorder(this.theme, "├", "─", "┤", innerWidth));
    }

    lines.push(...renderModalPanes(this.theme, this.panes, innerWidth));

    if (this.fullScreen) {
      const footerHeight = this.footerLines.length > 0 ? this.footerLines.length + 1 : 0;
      const bottomBorderHeight = 1;
      const targetRows = this.getFullScreenRows();
      lines.push(...createEmptyModalRows(Math.max(0, targetRows - lines.length - footerHeight - bottomBorderHeight), innerWidth, (value) => this.theme.fg("borderMuted", value)));
    }

    if (this.footerLines.length > 0) {
      lines.push(renderModalBorder(this.theme, "├", "─", "┤", innerWidth));
      lines.push(...renderFooterRows(this.theme, this.footerLines, innerWidth));
    }

    lines.push(renderModalBorder(this.theme, "└", "─", "┘", innerWidth));
    return this.fullScreen ? lines.slice(0, this.getFullScreenRows()) : lines.map((line) => centerModalLine(line, width));
  }

  /**
   * Returns target fullscreen row count.
   *
   * @returns Fullscreen row count.
   */
  private getFullScreenRows(): number {
    if (typeof this.fullScreenRows === "function") return Math.max(1, Math.floor(this.fullScreenRows()));
    if (typeof this.fullScreenRows === "number") return Math.max(1, Math.floor(this.fullScreenRows));
    return Math.max(1, process.stdout.rows || 40);
  }

  /**
   * Clears render caches for theme changes.
   */
  invalidate(): void {
    return undefined;
  }
}
