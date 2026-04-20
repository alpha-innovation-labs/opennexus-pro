import type { ElementSelection } from "../types.js";
import { formatElementSelection } from "./formatElementSelection.js";

/**
 * Formats the selected element list section.
 *
 * @param elements Selected elements.
 * @returns Markdown for the selected element section.
 */
export function formatElementSelections(elements: ElementSelection[] | undefined): string {
  if (!elements || elements.length === 0) {
    return "*No elements selected*\n\n";
  }

  let output = `### Selected Elements (${elements.length})\n\n`;
  for (const [index, element] of elements.entries()) {
    output += formatElementSelection(element, index);
  }

  return output;
}
