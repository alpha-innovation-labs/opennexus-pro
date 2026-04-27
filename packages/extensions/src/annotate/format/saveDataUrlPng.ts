import * as fs from "node:fs";
import { MAX_SCREENSHOT_BYTES } from "../constants.js";

/**
 * Persists a PNG data URL to disk after validating its size.
 *
 * @param dataUrl PNG data URL.
 * @param filePath Destination file path.
 */
export async function saveDataUrlPng(dataUrl: string, filePath: string): Promise<void> {
  if (!dataUrl.startsWith("data:image/")) {
    throw new Error("Invalid screenshot data");
  }

  const base64Data = dataUrl.replace(/^data:image\/\w+;base64,/, "");
  const buffer = Buffer.from(base64Data, "base64");
  if (buffer.length > MAX_SCREENSHOT_BYTES) {
    throw new Error("Screenshot too large");
  }

  await fs.promises.writeFile(filePath, buffer);
}
