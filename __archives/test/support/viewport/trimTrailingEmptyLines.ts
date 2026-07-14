/**
 * Removes trailing empty lines from a rendered viewport.
 *
 * @param lines Rendered viewport lines.
 * @returns Trimmed viewport lines.
 */
export function trimTrailingEmptyLines(lines: string[]): string[] {
  const nextLines = [...lines];
  while (nextLines.length > 0 && nextLines.at(-1)?.trim() === "") {
    nextLines.pop();
  }
  return nextLines;
}
