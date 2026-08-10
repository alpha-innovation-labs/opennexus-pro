import { truncateToWidth, visibleWidth } from "@earendil-works/pi-tui";
import { colorSecondaryText } from '@extensions/tron/colors/colorSecondaryText.ts';
import { colorToolCallIcon } from '@extensions/tron/colors/colorToolCallIcon.ts';
import { createRenderedOptions } from "./createRenderedOptions.ts";

/**
 * Shared compact Tron-style line renderer for tool and widget rows.
 *
 * @param params Render parameters.
 * @returns One ANSI-styled single line.
 */
export function renderCompactLine(params: {
  width: number;
  icon: string;
  label: string;
  main?: string;
  inlineStats?: string;
  renderedInlineStats?: string;
  options?: string;
  renderedOptions?: string;
  theme: { fg(color: string, text: string): string; bold(text: string): string };
}): string {
  const { width, icon, label, main = "", inlineStats = "", renderedInlineStats, options = "", renderedOptions, theme } = params;
  const safeWidth = Math.max(1, width);
  const leftPrefixPlain = [icon, label, inlineStats].filter(Boolean).join(" ");
  const leftPrefixWidth = visibleWidth(leftPrefixPlain);
  const optionsNaturalWidth = visibleWidth(options);
  const mainNaturalWidth = visibleWidth(main);
  const naturalGapWidth = main && options ? 2 : main || options ? 1 : 0;
  const naturalWidth = leftPrefixWidth + naturalGapWidth + mainNaturalWidth + optionsNaturalWidth;
  const availableAfterPrefix = Math.max(0, safeWidth - leftPrefixWidth - 1);
  const cappedOptionsWidth = Math.min(optionsNaturalWidth, Math.max(0, Math.floor(safeWidth * 0.35)), availableAfterPrefix);
  const maxOptionsWidth = options ? (naturalWidth <= safeWidth ? optionsNaturalWidth : cappedOptionsWidth) : 0;
  const shownOptions = options ? truncateToWidth(options, maxOptionsWidth, "…") : "";
  const optionsWidth = visibleWidth(shownOptions);
  const optionsGap = shownOptions ? 1 : 0;
  const maxMainWidth = main ? Math.max(0, safeWidth - leftPrefixWidth - optionsGap - optionsWidth - 1) : 0;
  const shownMain = main ? truncateToWidth(main, maxMainWidth, "…") : "";
  const leftPlain = [leftPrefixPlain, shownMain].filter(Boolean).join(" ");
  const leftWidth = visibleWidth(leftPlain);
  const gapWidth = Math.max(0, safeWidth - leftWidth - optionsGap - optionsWidth);
  const padWidth = Math.max(0, safeWidth - leftWidth - gapWidth - optionsGap - optionsWidth);

  return [
    colorToolCallIcon(icon),
    theme.fg("text", theme.bold(label)),
    inlineStats ? (renderedInlineStats ?? inlineStats) : "",
    shownMain ? colorSecondaryText(shownMain) : "",
  ].filter(Boolean).join(" ")
    + " ".repeat(gapWidth)
    + (shownOptions ? ` ${createRenderedOptions(shownOptions, renderedOptions, theme)}` : "")
    + " ".repeat(padWidth);
}
