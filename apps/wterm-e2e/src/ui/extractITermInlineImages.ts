import type { TerminalInlineImage } from "./TerminalInlineImage.js";

const ITERM_IMAGE_PATTERN = /\u001b\]1337;File=([^:]*):([^\u0007]*)\u0007/g;

/**
 * Extracts iTerm2 inline image payloads from terminal output.
 *
 * @param data Terminal output chunk.
 * @returns Text with image sequences removed and extracted images.
 */
export function extractITermInlineImages(data: string): { text: string; images: TerminalInlineImage[] } {
  const images: TerminalInlineImage[] = [];
  const text = data.replace(ITERM_IMAGE_PATTERN, (_match, params: string, base64Data: string) => {
    const mimeType = params.includes("name=") ? "image/png" : "image/png";
    images.push({ mimeType, base64Data });
    return "";
  });
  return { text, images };
}
