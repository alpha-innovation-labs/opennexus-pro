import { detectAtPrefix } from "./detectAtPrefix";
import { detectSlashPrefix } from "./detectSlashPrefix";
import type { TriggerState } from "./types";

/**
 * Resolves the active editor trigger state from text before the cursor.
 *
 * @param textBeforeCursor Text before the cursor.
 * @returns Trigger state or null.
 */
export function getTriggerState(textBeforeCursor: string): TriggerState | null {
	const atPrefix = detectAtPrefix(textBeforeCursor);
	if (atPrefix) {
		return { kind: "at", prefix: atPrefix };
	}
	const slashPrefix = detectSlashPrefix(textBeforeCursor);
	if (slashPrefix) {
		return { kind: "slash", prefix: slashPrefix };
	}
	return null;
}
