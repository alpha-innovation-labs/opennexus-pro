import type { ManagedExtensionRow } from "./types";

const kindRank: Record<ManagedExtensionRow["kind"], number> = {
	core: 0,
	"third-party": 1,
};

/**
 * Sorts extension rows by source group first, then extension id inside each group.
 *
 * @param rows Extension rows to sort.
 * @returns New row array with contiguous source groups.
 */
export function sortManagedExtensionRows(rows: ManagedExtensionRow[]): ManagedExtensionRow[] {
	return [...rows].sort((left, right) => kindRank[left.kind] - kindRank[right.kind] || left.id.localeCompare(right.id));
}
