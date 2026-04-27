import { isEditorBorderLine } from "../../shared/ui/isEditorBorderLine.js";

/**
 * Extracts content rows from the base editor chrome render.
 *
 * @param lines Full editor render output.
 * @returns Inner editor content lines.
 */
export function extractEditorContentLines(lines: string[]): string[] {
  const result: string[] = [];
  let seenTop = false;
  for (const line of lines) {
    if (isEditorBorderLine(line)) {
      if (!seenTop) {
        seenTop = true;
        continue;
      }
      break;
    }
    if (seenTop) result.push(line);
  }
  return result;
}
