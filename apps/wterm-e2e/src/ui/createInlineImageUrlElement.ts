/**
 * Creates a browser image element for one terminal-printed image URL.
 *
 * @param imageUrl Remote image URL.
 * @returns DOM image element.
 */
export function createInlineImageUrlElement(imageUrl: string): HTMLImageElement {
  const element = document.createElement("img");
  element.src = imageUrl;
  element.alt = "Terminal token image";
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
