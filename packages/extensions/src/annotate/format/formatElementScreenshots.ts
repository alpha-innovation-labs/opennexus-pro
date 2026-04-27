import * as os from "node:os";
import * as path from "node:path";
import type { ElementScreenshot } from "../types.js";
import { saveDataUrlPng } from "./saveDataUrlPng.js";

/**
 * Formats the per-element screenshot section.
 *
 * @param screenshots Element screenshots.
 * @param timestamp Shared timestamp for file names.
 * @returns Markdown for the screenshot list.
 */
export async function formatElementScreenshots(
  screenshots: ElementScreenshot[] | undefined,
  timestamp: number,
): Promise<string> {
  if (!screenshots || screenshots.length === 0) {
    return "";
  }

  let output = "### Screenshots\n\n";
  for (const [index, screenshot] of screenshots.entries()) {
    try {
      const safeIndex = Number.isFinite(screenshot.index)
        ? Math.max(1, Math.floor(screenshot.index))
        : index + 1;
      const screenshotPath = path.join(os.tmpdir(), `pi-annotate-${timestamp}-el${safeIndex}.png`);
      await saveDataUrlPng(screenshot.dataUrl, screenshotPath);
      output += `- Element ${safeIndex}: ${screenshotPath}\n`;
    } catch {
      output += `- Element ${screenshot?.index ?? index + 1}: *capture failed*\n`;
    }
  }

  return `${output}\n`;
}
