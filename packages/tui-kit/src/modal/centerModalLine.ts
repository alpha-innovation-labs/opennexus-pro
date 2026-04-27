import { visibleWidth } from "@mariozechner/pi-tui";

/**
 * Centers one rendered modal line within an available width.
 *
 * @param line Rendered modal line.
 * @param availableWidth Available terminal width.
 * @returns Line prefixed with left padding.
 */
export function centerModalLine(line: string, availableWidth: number): string {
  const padding = Math.max(0, Math.floor((availableWidth - visibleWidth(line)) / 2));
  return `${" ".repeat(padding)}${line}`;
}
