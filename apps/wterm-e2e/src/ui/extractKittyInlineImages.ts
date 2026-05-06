import type { TerminalInlineImage } from "./TerminalInlineImage.js";

const KITTY_IMAGE_PATTERN = /\u001b_G([^;]*);([^\u001b]*)\u001b\\/g;

/**
 * Extracts Kitty inline image payloads from terminal output.
 *
 * @param data Terminal output chunk.
 * @returns Text with image sequences removed and extracted images.
 */
export function extractKittyInlineImages(data: string): { text: string; images: TerminalInlineImage[] } {
  const images: TerminalInlineImage[] = [];
  const text = data.replace(KITTY_IMAGE_PATTERN, (_match, params: string, base64Data: string) => {
    const mimeType = params.includes("f=100") ? "image/png" : "image/png";
    images.push({ mimeType, base64Data });
    return "";
  });
  return { text, images };
}
