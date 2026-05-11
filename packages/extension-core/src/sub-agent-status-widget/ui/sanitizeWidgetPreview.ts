import { sanitizePlainText } from "@nexus/tui-kit/modal/index.js";

/**
 * Normalizes streamed widget text into one safe single-line preview.
 *
 * @param text Raw streamed text.
 * @returns Sanitized single-line preview.
 */
export function sanitizeWidgetPreview(text: string): string {
  const sanitized = sanitizePlainText(text)
    .split("\n")
    .map((line) => line.trim())
    .find(Boolean) ?? "";
  return sanitized.replace(/\s+/g, " ").trim();
}
