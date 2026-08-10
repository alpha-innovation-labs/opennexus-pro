import type { ManagedExtensionRow, ManagedExtensionStatus } from "./types.js";

/**
 * Updates one managed extension row status.
 *
 * @param rows Current rows.
 * @param extensionId Extension id to update.
 * @param status New status.
 * @returns Updated row list.
 */
export function updateManagedExtensionRows(
	rows: ManagedExtensionRow[],
	extensionId: string,
	status: ManagedExtensionStatus,
): ManagedExtensionRow[] {
	return rows.map((row) => (row.id === extensionId ? { ...row, status } : row));
}
