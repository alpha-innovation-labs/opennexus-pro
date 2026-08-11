import { matchesCmuxSurfaceRegistration } from "./matchesCmuxSurfaceRegistration";
import { pruneCmuxSessionRegistryEntries } from "./pruneCmuxSessionRegistryEntries";
import type { CmuxSessionRegistry, CmuxSessionRegistryEntry } from "./types";

/**
 * Upserts one Nexus session registration into a registry object.
 *
 * @param registry Existing registry.
 * @param nextEntry Entry to insert or replace.
 * @returns Updated registry.
 */
export function upsertCmuxSessionRegistryEntry(
	registry: CmuxSessionRegistry,
	nextEntry: CmuxSessionRegistryEntry,
): CmuxSessionRegistry {
	const entries = pruneCmuxSessionRegistryEntries(registry.entries).filter(
		(entry) =>
			!matchesCmuxSurfaceRegistration(
				entry,
				nextEntry.workspaceId,
				nextEntry.surfaceId,
			),
	);
	return { version: 1, entries: [...entries, nextEntry] };
}
