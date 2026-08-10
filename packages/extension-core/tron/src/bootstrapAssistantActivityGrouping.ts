import type { SessionEntry } from "@nexus/pi-platform/sessionManager";
import { resetAssistantActivityGrouping } from "./resetAssistantActivityGrouping";

/**
 * Standalone tool mode resets any stale grouping cache without rebuilding it.
 *
 * @param entries Session entries from the active branch.
 */
export function bootstrapAssistantActivityGrouping(entries: SessionEntry[]): void {
	void entries;
	resetAssistantActivityGrouping();
}
