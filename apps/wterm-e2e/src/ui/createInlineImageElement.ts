import type { TerminalInlineImage } from "./TerminalInlineImage.js";

/**
 * Creates a browser image element for one terminal inline image payload.
 *
 * @param image Extracted terminal inline image.
 * @returns DOM image element.
 */
export function createInlineImageElement(image: TerminalInlineImage): HTMLImageElement {
  const element = document.createElement("img");
  element.src = `data:${image.mimeType};base64,${image.base64Data}`;
  element.alt = "Terminal inline image";
  element.style.display = "block";
  element.style.width = "96px";
  element.style.height = "96px";
  element.style.objectFit = "contain";
  element.style.position = "fixed";
  element.style.left = "12px";
  element.style.bottom = "12px";
  element.style.zIndex = "2147483647";
  element.style.background = "#ffffff";
  element.style.border = "2px solid #8b5cf6";
  element.dataset.terminalInlineImage = "true";
  return element;
}
