import type { ExtensionCommandContext } from "@mariozechner/pi-coding-agent";
import { renderTronBubble } from "./renderTronBubble.js";

/**
 * Renders the input with the exact Tron user-message bubble styling.
 */
export function renderTronInputLines(input: string, width: number, _theme: ExtensionCommandContext["ui"]["theme"]): string[] {
	return renderTronBubble(input, width);
}
