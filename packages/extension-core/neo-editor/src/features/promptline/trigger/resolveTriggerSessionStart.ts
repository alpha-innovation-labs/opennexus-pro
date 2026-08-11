import { getTriggerState } from "./getTriggerState";
import type { TriggerState } from "./types";

/**
 * Resolves whether one typed character should start a new trigger session.
 *
 * `/` only starts from an empty editor. `@` starts whenever the resulting
 * text before the cursor forms a valid attachment trigger.
 *
 * @param data Raw terminal input.
 * @param textBeforeCursor Current text before the cursor.
 * @param editorText Full editor text before applying the input.
 * @returns Trigger session state to start, or null.
 */
export function resolveTriggerSessionStart(
	data: string,
	textBeforeCursor: string,
	editorText: string,
): TriggerState | null {
	if (data === "/") {
		return editorText.length === 0 ? { kind: "slash", prefix: "/" } : null;
	}

	if (data !== "@") {
		return null;
	}

	const nextState = getTriggerState(`${textBeforeCursor}@`);
	return nextState?.kind === "at" ? nextState : null;
}
