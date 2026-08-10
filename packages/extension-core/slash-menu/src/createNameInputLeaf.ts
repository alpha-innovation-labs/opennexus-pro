import type { SlashMenuLeaf } from "./types";

/**
 * Builds the visible row for the session-name input submenu.
 *
 * @param value Current edited session name.
 * @returns Session-name input leaf.
 */
export function createNameInputLeaf(value: string): SlashMenuLeaf {
  return {
    kind: "entry",
    label: value || "(empty)",
    description: "Edit session display name",
    value: "name-input",
  };
}
