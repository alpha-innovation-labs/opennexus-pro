import { closeToolActivityGroup } from "./closeToolActivityGroup";

/**
 * Marks a user message boundary, which always closes the active tool group.
 */
export function noteUserMessage(): void {
	closeToolActivityGroup();
}
