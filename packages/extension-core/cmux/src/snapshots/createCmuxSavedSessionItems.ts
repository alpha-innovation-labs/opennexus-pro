import type { AutocompleteItem } from "@earendil-works/pi-tui";
import { formatCmuxSavedSessionDate } from "./formatCmuxSavedSessionDate";
import type { CmuxSavedSession } from "./types";

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
