import type { AnnotationResult } from "../types.js";

/**
 * Builds the markdown header for a successful annotation result.
 *
 * @param result Annotation result.
 * @returns Header markdown.
 */
export function buildAnnotationHeader(result: AnnotationResult): string {
  let output = `## Page Annotation: ${result.url || "Unknown"}\n`;

  if (result.viewport) {
    output += `**Viewport:** ${result.viewport.width}×${result.viewport.height}\n\n`;
  }

  if (result.prompt) {
    output += `**Context:** ${result.prompt}\n\n`;
  }

  const hasDebugData = result.elements?.some(
    (element) => element.computedStyles || element.parentContext || element.cssVariables,
  );
  if (hasDebugData) {
    output += "**Debug Mode:** Enabled\n\n";
  }

  return output;
}
