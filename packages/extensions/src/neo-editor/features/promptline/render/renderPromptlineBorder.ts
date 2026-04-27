import type { ExtensionContext } from "@mariozechner/pi-coding-agent";
import { truncateToWidth, visibleWidth } from "@mariozechner/pi-tui";

/**
 * Renders the top promptline border row.
 *
 * @param borderColor Border color formatter.
 * @param uiTheme UI theme.
 * @param width Available width.
 * @param promptline Promptline segments.
 * @returns Rendered border content.
 */
export function renderPromptlineBorder(
  borderColor: (text: string) => string,
  uiTheme: ExtensionContext["ui"]["theme"],
  width: number,
  promptline: { left: string; right: string },
): string {
  if (width <= 0) return "";

  const leftPrefix = "─ ";
  const rightSuffix = " ─";
  const rightContent = promptline.right;
  const reservedWidth = visibleWidth(leftPrefix) + visibleWidth(rightSuffix) + visibleWidth(rightContent);
  const maxLeftWidth = Math.max(1, width - reservedWidth);
  const leftContent = truncateToWidth(promptline.left, maxLeftWidth, uiTheme.fg("dim", "…"));
  const fillerWidth = Math.max(0, width - visibleWidth(leftPrefix) - visibleWidth(leftContent) - visibleWidth(rightContent) - visibleWidth(rightSuffix));
  return borderColor(leftPrefix) + leftContent + borderColor("─".repeat(fillerWidth)) + rightContent + borderColor(rightSuffix);
}
