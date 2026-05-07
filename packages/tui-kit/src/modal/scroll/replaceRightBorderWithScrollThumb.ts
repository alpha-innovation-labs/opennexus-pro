/**
 * Replaces the right modal border in one row with a scrollbar thumb.
 *
 * @param line Rendered modal row.
 * @param thumb The scrollbar thumb character.
 * @returns Row with the right border converted into a scrollbar thumb.
 */
export function replaceRightBorderWithScrollThumb(line: string, thumb: string): string {
  const rightBorderIndex = Math.max(line.lastIndexOf("│"), line.lastIndexOf("┤"), line.lastIndexOf("┐"), line.lastIndexOf("┘"));
  if (rightBorderIndex < 0) return line;
  return `${line.slice(0, rightBorderIndex)}${thumb}${line.slice(rightBorderIndex + 1)}`;
}
