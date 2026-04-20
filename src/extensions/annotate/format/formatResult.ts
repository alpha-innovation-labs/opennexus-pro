import { buildAnnotationHeader } from "./buildAnnotationHeader.js";
import { formatEditCaptureSection } from "./formatEditCaptureSection.js";
import { formatElementScreenshots } from "./formatElementScreenshots.js";
import { formatElementSelections } from "./formatElementSelections.js";
import { formatFailedAnnotationResult } from "./formatFailedAnnotationResult.js";
import { formatFullPageScreenshot } from "./formatFullPageScreenshot.js";
import type { AnnotationResult } from "../types.js";

/**
 * Formats an annotation result into markdown for Pi.
 *
 * @param result Annotation result.
 * @returns Final markdown payload.
 */
export async function formatResult(result: AnnotationResult): Promise<string> {
  if (!result.success) {
    return formatFailedAnnotationResult(result);
  }

  const timestamp = Date.now();
  let output = buildAnnotationHeader(result);
  output += formatElementSelections(result.elements);
  output += await formatFullPageScreenshot(result.screenshot, timestamp);
  output += await formatElementScreenshots(result.screenshots, timestamp);
  output += await formatEditCaptureSection(result.editCapture, timestamp);
  return output;
}
