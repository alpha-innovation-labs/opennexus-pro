import type { CmuxSessionRegistryEntry } from "./types";
/**
 * Removes registry entries whose owning Nexus process exited.
 *
 * @param entries Registry entries to filter.
 * @returns Live registry entries.
 */
export declare function pruneCmuxSessionRegistryEntries(entries: CmuxSessionRegistryEntry[]): CmuxSessionRegistryEntry[];
