import { getCmuxSessionRegistryPath } from "./getCmuxSessionRegistryPath.js";
import { pruneCmuxSessionRegistryEntries } from "./pruneCmuxSessionRegistryEntries.js";
import { readCmuxSessionRegistry } from "./readCmuxSessionRegistry.js";
import type { CmuxSessionRegistryEntry } from "./types.js";

/**
 * Reads live Nexus cmux session registrations.
 *
 * @returns Registry entries with running owner processes.
 */
export async function readLiveCmuxSessionRegistryEntries(): Promise<CmuxSessionRegistryEntry[]> {
	const registry = await readCmuxSessionRegistry(getCmuxSessionRegistryPath());
	return pruneCmuxSessionRegistryEntries(registry.entries);
}
