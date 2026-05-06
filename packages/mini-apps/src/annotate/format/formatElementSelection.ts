import type { ElementSelection } from "../types.js";
import { formatElementLabel } from "./formatElementLabel.js";
import { formatElementLocation } from "./formatElementLocation.js";

/**
 * Formats a single selected element into markdown.
 *
 * @param element Selected element data.
 * @param index 0-based element index.
 * @returns Markdown block for one element.
 */
export function formatElementSelection(element: ElementSelection, index: number): string {
  let output = `### ${index + 1}. ${formatElementLabel(element)}\n`;
  output += `**Location:** ${formatElementLocation(element)}\n`;
  output += `**Feedback:** ${element.comment?.trim() || "No feedback provided."}\n`;

  if (element.computedStyles && Object.keys(element.computedStyles).length > 0) {
    output += "\n<details>\n<summary>Debug details</summary>\n\n";
    output += `- Selector: \`${element.selector}\`\n`;
    output += `- Size: ${element.rect.width}×${element.rect.height}px\n`;
    output += "- Computed Styles:\n";
    for (const [key, value] of Object.entries(element.computedStyles)) {
      output += `  - ${key}: ${value}\n`;
    }
    output += "\n</details>\n";
  }

  return `${output}\n`;
}
