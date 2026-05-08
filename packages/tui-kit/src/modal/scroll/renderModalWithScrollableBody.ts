import type { SharedModalTheme } from "../types.js";
import { replaceRightBorderWithScrollThumb } from "./replaceRightBorderWithScrollThumb.js";

export type ScrollableModalBodyResult = {
  lines: string[];
  maxScrollOffset: number;
  scrollOffset: number;
  visibleBodyRows: number;
};

/**
 * Renders modal rows with fixed chrome and a scrollable body section.
 *
 * @param theme Modal theme used to color the scrollbar thumb.
 * @param topRows Rows that must stay pinned to the top.
 * @param bodyRows Content rows that may scroll.
 * @param bottomRows Rows that must stay pinned to the bottom.
 * @param visibleRows Available terminal rows.
 * @param requestedScrollOffset Desired body scroll offset.
 * @param showScrollbar Whether to draw an overflow scrollbar.
 * @returns Visible modal rows and clamped body scroll metadata.
 */
export function renderModalWithScrollableBody(
  theme: SharedModalTheme,
  topRows: string[],
  bodyRows: string[],
  bottomRows: string[],
  visibleRows: number,
  requestedScrollOffset: number,
  showScrollbar = true,
): ScrollableModalBodyResult {
  const rowBudget = Math.max(1, Math.floor(visibleRows));
  const frameRows = [...topRows, ...bodyRows, ...bottomRows];
  if (frameRows.length <= rowBudget) return { lines: frameRows, maxScrollOffset: 0, scrollOffset: 0, visibleBodyRows: bodyRows.length };

  const visibleBodyRows = Math.max(1, rowBudget - topRows.length - bottomRows.length);
  const maxScrollOffset = Math.max(0, bodyRows.length - visibleBodyRows);
  const scrollOffset = Math.max(0, Math.min(maxScrollOffset, requestedScrollOffset));
  const visibleBody = bodyRows.slice(scrollOffset, scrollOffset + visibleBodyRows);
  const bodyWithScrollbar = showScrollbar ? renderBodyScrollbar(theme, visibleBody, scrollOffset, maxScrollOffset, bodyRows.length) : visibleBody;
  const fixedFrame = [...topRows, ...bodyWithScrollbar, ...bottomRows];

  return {
    lines: fixedFrame.slice(Math.max(0, fixedFrame.length - rowBudget)),
    maxScrollOffset,
    scrollOffset,
    visibleBodyRows,
  };
}

/**
 * Adds a proportional scrollbar thumb to visible body rows.
 *
 * @param theme Modal theme used to color the thumb.
 * @param rows Visible body rows.
 * @param scrollOffset Current body scroll offset.
 * @param maxScrollOffset Maximum body scroll offset.
 * @param totalRows Total scrollable body rows.
 * @returns Body rows with a right-side scrollbar thumb.
 */
function renderBodyScrollbar(theme: SharedModalTheme, rows: string[], scrollOffset: number, maxScrollOffset: number, totalRows: number): string[] {
  if (maxScrollOffset <= 0 || rows.length === 0) return rows;
  const thumbHeight = Math.max(1, Math.floor((rows.length / totalRows) * rows.length));
  const travel = Math.max(0, rows.length - thumbHeight);
  const thumbTop = maxScrollOffset === 0 ? 0 : Math.round((scrollOffset / maxScrollOffset) * travel);
  const thumb = theme.fg("border", "┃");

  return rows.map((row, index) => (index >= thumbTop && index < thumbTop + thumbHeight ? replaceRightBorderWithScrollThumb(row, thumb) : row));
}
