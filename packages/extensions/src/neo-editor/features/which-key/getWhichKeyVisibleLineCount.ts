/**
 * Computes how many hotkey content lines fit while keeping the footer visible.
 *
 * @param terminalRows Current terminal row count.
 * @param headerLines Header line count.
 * @param footerLines Footer line count.
 * @returns Visible content line count.
 */
export function getWhichKeyVisibleLineCount(terminalRows: number, headerLines: number, footerLines: number): number {
  const frameRows = 1 + headerLines + 1 + 1 + footerLines + 1;
  return Math.max(1, terminalRows - frameRows);
}
