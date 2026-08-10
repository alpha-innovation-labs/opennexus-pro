import { createTopLevelItems } from "./createTopLevelItems.js";

/**
 * Finds one top-level slash menu item by value.
 *
 * @param value Item value.
 * @returns Matching item, if found.
 */
export function findTopLevelItem(value: string) {
  return createTopLevelItems().find((item) => item.value === value);
}
