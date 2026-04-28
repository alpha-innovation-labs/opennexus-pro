import type { ElementSelection } from "../types.js";
import { truncateInlineText } from "./truncateInlineText.js";

const TEXT_LABEL_TAGS = new Set(["a", "button", "h1", "h2", "h3", "h4", "h5", "h6", "label", "p", "span"]);

/**
 * Formats the compact heading label for one annotated element.
 *
 * @param element Selected element data.
 * @returns Human-readable element label.
 */
export function formatElementLabel(element: ElementSelection): string {
  const text = truncateInlineText(element.text ?? "", 64);
  if (text && TEXT_LABEL_TAGS.has(element.tag)) {
    return `${element.tag} "${text}"`;
  }

  if (element.id) return `${element.tag} #${element.id}`;
  if (element.classes?.[0]) return `${element.tag} .${element.classes[0]}`;
  return element.tag;
}
