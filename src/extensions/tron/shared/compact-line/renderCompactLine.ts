import { truncateToWidth, visibleWidth } from "@mariozechner/pi-tui";
import { truncateFromStart } from "../../compact-tool-lines/truncateFromStart.ts";
import { colorSecondaryText } from "../../colors/colorSecondaryText.ts";
import { colorToolCallIcon } from "../../colors/colorToolCallIcon.ts";
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
  options?: string;
  renderedOptions?: string;
  theme: { fg(color: string, text: string): string; bold(text: string): string };
}): string {
  const { width, icon, label, main = "", options = "", renderedOptions, theme } = params;
  const safeWidth = Math.max(1, width);
  const leftPrefixPlain = `${icon} ${label}`;
  const leftPrefixWidth = visibleWidth(leftPrefixPlain);
  const maxOptionsWidth = options ? Math.max(0, safeWidth - leftPrefixWidth - 1) : 0;
  const shownOptions = options ? truncateToWidth(options, maxOptionsWidth, "…") : "";
  const optionsWidth = visibleWidth(shownOptions);
  const optionsGap = shownOptions ? 1 : 0;
  const maxMainWidth = main ? Math.max(0, safeWidth - leftPrefixWidth - optionsGap - optionsWidth - 1) : 0;
  const shownMain = main ? truncateFromStart(main, maxMainWidth, "…") : "";
  const leftPlain = [leftPrefixPlain, shownMain].filter(Boolean).join(" ");
  const leftWidth = visibleWidth(leftPlain);
  const gapWidth = Math.max(0, safeWidth - leftWidth - optionsGap - optionsWidth);
  const padWidth = Math.max(0, safeWidth - leftWidth - gapWidth - optionsGap - optionsWidth);

  return [
    colorToolCallIcon(icon),
    theme.fg("text", theme.bold(label)),
    shownMain ? colorSecondaryText(shownMain) : "",
  ].filter(Boolean).join(" ")
    + " ".repeat(gapWidth)
    + (shownOptions ? ` ${createRenderedOptions(shownOptions, renderedOptions, theme)}` : "")
    + " ".repeat(padWidth);
}
