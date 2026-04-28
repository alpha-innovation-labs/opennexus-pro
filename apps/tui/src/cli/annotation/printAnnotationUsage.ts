import { createAnnotationUsageText } from "./createAnnotationUsageText.js";

/**
 * Prints the supported annotation command usage.
 */
export function printAnnotationUsage(): void {
  console.log(createAnnotationUsageText());
}
