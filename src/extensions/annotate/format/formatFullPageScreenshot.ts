import * as os from "node:os";
import * as path from "node:path";
import { saveDataUrlPng } from "./saveDataUrlPng.js";

/**
 * Formats the full-page screenshot section.
 *
 * @param screenshot Screenshot data URL.
 * @param timestamp Shared timestamp for file names.
 * @returns Markdown for the full screenshot section.
 */
export async function formatFullPageScreenshot(
  screenshot: string | undefined,
  timestamp: number,
): Promise<string> {
  if (!screenshot) {
    return "";
  }

  try {
    const screenshotPath = path.join(os.tmpdir(), `pi-annotate-${timestamp}-full.png`);
    await saveDataUrlPng(screenshot, screenshotPath);
    return `**Screenshot (full page):** ${screenshotPath}\n`;
  } catch (error) {
    return `*Screenshot capture failed: ${error}*\n`;
  }
}
