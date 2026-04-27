import { renderCompactInputBubble } from "../../tron/user-message/renderCompactInputBubble.ts";
import { renderPlainTronBubble } from "./renderPlainTronBubble.js";

/**
 * Renders the exact Tron user-message bubble with a safe fallback for tests before theme init.
 */
export function renderTronBubble(text: string, width: number): string[] {
	try {
		return renderCompactInputBubble(text || " ", width);
	} catch {
		return renderPlainTronBubble(text, width);
	}
}
