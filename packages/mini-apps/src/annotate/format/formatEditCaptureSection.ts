import type { EditCapture } from "../types.js";
import { formatEditCapture } from "./formatEditCapture.js";
import { formatEditCaptureScreenshots } from "./formatEditCaptureScreenshots.js";

/**
 * Formats the full edit-capture section.
 *
 * @param capture Edit capture payload.
 * @param timestamp Shared timestamp for file names.
 * @returns Markdown for the edit capture section.
 */
export async function formatEditCaptureSection(
  capture: EditCapture | undefined,
  timestamp: number,
): Promise<string> {
  if (!capture || capture.changeCount <= 0) {
    return "";
  }

  let output = `## Edit Capture (${capture.changeCount} changes, ${Math.round(capture.duration / 1000)}s)\n\n`;
  output += formatEditCapture(capture);
  output += await formatEditCaptureScreenshots(capture, timestamp);
  return output;
}
