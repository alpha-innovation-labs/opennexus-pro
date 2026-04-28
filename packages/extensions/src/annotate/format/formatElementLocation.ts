import type { ElementSelection } from "../types.js";

/**
 * Formats the compact DOM location for one annotated element.
 *
 * @param element Selected element data.
 * @returns DOM location suitable for agent navigation.
 */
export function formatElementLocation(element: ElementSelection): string {
  return element.location || element.selector;
}
