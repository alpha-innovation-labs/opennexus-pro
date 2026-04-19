import { setActiveToolGroup } from "./state.ts";

/**
 * Closes the current contiguous tool group.
 */
export function closeToolActivityGroup(): void {
	setActiveToolGroup([]);
}
