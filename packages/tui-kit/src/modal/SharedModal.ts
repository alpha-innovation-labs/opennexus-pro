import { Key, matchesKey, type Component } from "@mariozechner/pi-tui";
import { centerModalLine } from "./centerModalLine.js";
import { computeModalWidth } from "./computeModalWidth.js";
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
  setWidthPolicy(minWidth: number, maxWidth?: number, maxWidthRatio = this.maxWidthRatio): void {
    this.minWidth = minWidth;
    this.maxWidth = maxWidth;
    this.maxWidthRatio = maxWidthRatio;
  }

  /**
   * Renders the shared modal frame.
   *
   * @param width Available terminal width.
   * @returns Rendered modal lines.
   */
  render(width: number): string[] {
    const computedWidth = computeModalWidth(width, this.minWidth, this.maxWidthRatio);
    const modalWidth = this.maxWidth === undefined ? computedWidth : Math.min(computedWidth, this.maxWidth, width);
    const innerWidth = Math.max(1, modalWidth - 2);
    const lines = [renderModalBorder(this.theme, "┌", "─", "┐", innerWidth)];

    if (this.headerLines.length > 0) {
      lines.push(...renderFullWidthRows(this.theme, this.headerLines, innerWidth));
      lines.push(renderModalBorder(this.theme, "├", "─", "┤", innerWidth));
    }

    lines.push(...renderModalPanes(this.theme, this.panes, innerWidth));

    if (this.footerLines.length > 0) {
      lines.push(renderModalBorder(this.theme, "├", "─", "┤", innerWidth));
      lines.push(...renderFooterRows(this.theme, this.footerLines, innerWidth));
    }

    lines.push(renderModalBorder(this.theme, "└", "─", "┘", innerWidth));
    return lines.map((line) => centerModalLine(line, width));
  }

  /**
   * Clears render caches for theme changes.
   */
  invalidate(): void {
    return undefined;
  }
}
