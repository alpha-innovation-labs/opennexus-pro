import type { EditCapture } from "../types.js";

/**
 * Formats edit-capture details into markdown.
 *
 * @param capture Edit capture payload.
 * @returns Markdown section body for the captured edits.
 */
export function formatEditCapture(capture: EditCapture): string {
  let output = "";

  if (capture.warnings?.length) {
    for (const warning of capture.warnings) {
      output += `> **Note:** ${warning}\n`;
    }
    output += "\n";
  }

  if (capture.inlineStyles.length > 0) {
    output += "### Inline Style Changes\n\n";
    for (const change of capture.inlineStyles) {
      output += `**\`${change.selector}\`**\n`;
      for (const changed of change.changed) {
        output += `- \`${changed.property}\`: \`${changed.from}\` → \`${changed.to}\`\n`;
      }
      for (const [property, value] of Object.entries(change.added)) {
        output += `- \`${property}\`: added \`${value}\`\n`;
      }
      for (const property of change.removed) {
        output += `- \`${property}\`: removed\n`;
      }
      output += "\n";
    }
  }

  if (capture.rules.length > 0) {
    output += "### CSS Rule Changes\n\n";
    for (const change of capture.rules) {
      output += `**\`${change.ruleSelector}\`** (${change.sheet})\n`;
      for (const changed of change.changed) {
        output += `- \`${changed.property}\`: \`${changed.from}\` → \`${changed.to}\`\n`;
      }
      for (const [property, value] of Object.entries(change.added)) {
        output += `- \`${property}\`: added \`${value}\`\n`;
      }
      for (const property of change.removed) {
        output += `- \`${property}\`: removed\n`;
      }
      output += "\n";
    }
  }

  if (capture.dom.length > 0) {
    output += "### DOM Changes\n\n";
    for (const change of capture.dom) {
      output += `- **\`${change.selector}\`** — ${change.detail}\n`;
    }
    output += "\n";
  }

  return output;
}
