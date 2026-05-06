import { extractITermInlineImages } from "./extractITermInlineImages.js";
import { extractKittyInlineImages } from "./extractKittyInlineImages.js";
import type { TerminalInlineImage } from "./TerminalInlineImage.js";

/**
 * Extracts supported terminal inline image sequences from output text.
 *
 * @param data Terminal output chunk.
 * @returns Clean terminal text and extracted images.
 */
export function extractTerminalInlineImages(data: string): { text: string; images: TerminalInlineImage[] } {
  const iTerm = extractITermInlineImages(data);
  const kitty = extractKittyInlineImages(iTerm.text);
  return { text: kitty.text, images: [...iTerm.images, ...kitty.images] };
}
