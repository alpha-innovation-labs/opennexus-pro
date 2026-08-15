import { detectSlashPrefix } from "./detectSlashPrefix";
import { getTriggerState } from "./getTriggerState";
import type { TriggerState } from "./types";

/**
 * Resolves whether one typed character should start a new trigger session.
 *
 * `/` starts whenever the text before the cursor forms a valid slash
 * prefix. `@` starts whenever the resulting text before the cursor forms
 * a valid attachment trigger.
 *
 * @param data Raw terminal input.
 * @param textBeforeCursor Current text before the cursor.
 * @param _editorText Full editor text before applying the input.
 * @returns Trigger session state to start, or null.
 */
export function resolveTriggerSessionStart(
	data: string,
	textBeforeCursor: string,
	_editorText: string,
): TriggerState | null {
	if (data === "/") {
		const slashPrefix = detectSlashPrefix(textBeforeCursor);
		if (slashPrefix) {
			return { kind: "slash", prefix: slashPrefix };
		}
		if (textBeforeCursor.length === 0) {
			return { kind: "slash", prefix: "/" };
		}
		return null;
	}

	if (data !== "@") {
		return null;
	}

	const nextState = getTriggerState(`${textBeforeCursor}@`);
	return nextState?.kind === "at" ? nextState : null;
}
