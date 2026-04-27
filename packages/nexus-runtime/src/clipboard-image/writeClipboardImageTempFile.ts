import { randomUUID } from "node:crypto";
import { writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { ClipboardImage } from "./types.js";

/**
 * Writes clipboard image bytes to a temporary PNG file.
 *
 * @param image Clipboard image bytes.
 * @returns Temporary image path.
 */
export function writeClipboardImageTempFile(image: ClipboardImage): string {
  const filePath = join(tmpdir(), `pi-clipboard-${randomUUID()}.png`);
  writeFileSync(filePath, Buffer.from(image.bytes));
  return filePath;
}
