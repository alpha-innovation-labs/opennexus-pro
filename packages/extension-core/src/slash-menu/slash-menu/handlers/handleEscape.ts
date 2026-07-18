import type { SlashMenuState } from "../state.ts";

/**
 * Returns what Escape should do based on current state.
 * Pure function.
 */
export function handleEscape(state: SlashMenuState): "close" | "back" {
  return state.level === "top" ? "close" : "back";
}
