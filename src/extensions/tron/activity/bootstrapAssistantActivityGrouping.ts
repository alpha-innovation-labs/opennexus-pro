import type { SessionEntry } from "../../../pi-internals/sessionManager.js";
import { resetAssistantActivityGrouping } from "./resetAssistantActivityGrouping.ts";

/**
 * Standalone tool mode resets any stale grouping cache without rebuilding it.
 *
 * @param entries Session entries from the active branch.
 */
export function bootstrapAssistantActivityGrouping(entries: SessionEntry[]): void {
	void entries;
	resetAssistantActivityGrouping();
}
