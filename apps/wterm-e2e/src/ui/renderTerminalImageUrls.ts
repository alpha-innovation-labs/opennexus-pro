import { createInlineImageUrlElement } from "./createInlineImageUrlElement.js";

const renderedUrls = new Set<string>();

/**
 * Renders terminal-printed image URLs as browser images for wterm verification.
 *
 * @param imageUrls Image URLs discovered in terminal text.
 */
export function renderTerminalImageUrls(imageUrls: string[]): void {
  for (const imageUrl of imageUrls) {
    if (renderedUrls.has(imageUrl)) continue;
    renderedUrls.add(imageUrl);
    document.body.appendChild(createInlineImageUrlElement(imageUrl));
  }
}
