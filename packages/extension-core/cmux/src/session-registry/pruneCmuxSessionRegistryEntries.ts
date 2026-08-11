import { isProcessRunning } from "./isProcessRunning";
import type { CmuxSessionRegistryEntry } from "./types";

/**
 * Removes registry entries whose owning Nexus process exited.
 *
 * @param entries Registry entries to filter.
 * @returns Live registry entries.
 */
export function pruneCmuxSessionRegistryEntries(
	entries: CmuxSessionRegistryEntry[],
): CmuxSessionRegistryEntry[] {
	return entries.filter((entry) => isProcessRunning(entry.pid));
}
