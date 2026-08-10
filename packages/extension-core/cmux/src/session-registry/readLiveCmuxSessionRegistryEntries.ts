import { getCmuxSessionRegistryPath } from "./getCmuxSessionRegistryPath";
import { pruneCmuxSessionRegistryEntries } from "./pruneCmuxSessionRegistryEntries";
import { readCmuxSessionRegistry } from "./readCmuxSessionRegistry";
import type { CmuxSessionRegistryEntry } from "./types";

/**
 * Reads live Nexus cmux session registrations.
 *
 * @returns Registry entries with running owner processes.
 */
export async function readLiveCmuxSessionRegistryEntries(): Promise<CmuxSessionRegistryEntry[]> {
	const registry = await readCmuxSessionRegistry(getCmuxSessionRegistryPath());
	return pruneCmuxSessionRegistryEntries(registry.entries);
}
