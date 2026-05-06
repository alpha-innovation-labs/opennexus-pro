import { renderCompactInputBubble } from "@nexus/extensions/tron/user-message/renderCompactInputBubble.ts";

/**
 * Renders one user transcript entry with the Tron user bubble styling.
 *
 * @param text User message text.
 * @param width Available content width.
 * @returns Rendered user lines.
 */
export function renderUserEntry(text: string, width: number): string[] {
	return renderCompactInputBubble(text, width);
}
