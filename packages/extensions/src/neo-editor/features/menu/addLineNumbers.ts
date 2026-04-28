import type { SharedModalTheme } from "@nexus/tui-kit/modal/index.js";

/**
 * Adds muted one-based line numbers to rendered preview lines.
 *
 * @param lines Lines to number.
 * @param theme Active UI theme.
 * @returns Numbered lines.
 */
export function addLineNumbers(lines: string[], theme: SharedModalTheme): string[] {
  const digits = Math.max(2, String(lines.length).length);
  return lines.map((line, index) => {
    const number = theme.fg("muted", String(index + 1).padStart(digits, " "));
    const separator = theme.fg("muted", " ┊ ");
    return `${number}${separator}${line}`;
  });
}
