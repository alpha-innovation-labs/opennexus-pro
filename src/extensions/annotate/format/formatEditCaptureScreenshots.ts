import * as os from "node:os";
import * as path from "node:path";
import type { EditCapture } from "../types.js";
import { saveDataUrlPng } from "./saveDataUrlPng.js";

/**
 * Formats edit-capture before and after screenshots.
 *
 * @param capture Edit capture payload.
 * @param timestamp Shared timestamp for file names.
 * @returns Markdown for before and after screenshots.
 */
export async function formatEditCaptureScreenshots(
  capture: EditCapture,
  timestamp: number,
): Promise<string> {
  if (!capture.beforeScreenshot && !capture.afterScreenshot) {
    return "";
  }

  let output = "### Before/After Screenshots\n\n";

  if (capture.beforeScreenshot) {
    try {
      const beforePath = path.join(os.tmpdir(), `pi-annotate-${timestamp}-before.png`);
      await saveDataUrlPng(capture.beforeScreenshot, beforePath);
      output += `- Before: ${beforePath}\n`;
    } catch {}
  }

  if (capture.afterScreenshot) {
    try {
      const afterPath = path.join(os.tmpdir(), `pi-annotate-${timestamp}-after.png`);
      await saveDataUrlPng(capture.afterScreenshot, afterPath);
      output += `- After: ${afterPath}\n`;
    } catch {}
  }

  return `${output}\n`;
}
