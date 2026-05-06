import { createInlineImageElement } from "./createInlineImageElement.js";
import type { TerminalInlineImage } from "./TerminalInlineImage.js";

/**
 * Renders extracted terminal inline images below the browser terminal.
 *
 * @param container WTerm container element.
 * @param images Extracted terminal images.
 */
export function renderTerminalInlineImages(_container: HTMLElement, images: TerminalInlineImage[]): void {
  for (const image of images) {
    document.body.appendChild(createInlineImageElement(image));
  }
}
