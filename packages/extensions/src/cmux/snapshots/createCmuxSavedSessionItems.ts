import type { AutocompleteItem } from "@mariozechner/pi-tui";
import { formatCmuxSavedSessionDate } from "./formatCmuxSavedSessionDate.js";
import type { CmuxSavedSession } from "./types.js";

/**
 * Converts saved cmux sessions to select modal items.
 *
 * @param sessions Saved cmux sessions.
 * @returns Selectable saved-session items.
 */
export function createCmuxSavedSessionItems(sessions: CmuxSavedSession[]): AutocompleteItem[] {
	return sessions.map((session) => ({
		value: session.id,
		label: session.name,
		description: formatCmuxSavedSessionDate(session.createdAt),
	}));
}
