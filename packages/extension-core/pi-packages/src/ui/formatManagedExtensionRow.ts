import type { ManagedExtensionRow } from "../model/types.js";
import { colorManagedExtensionStatus } from "./colorManagedExtensionStatus.js";
import { padManagedExtensionColumn } from "./padManagedExtensionColumn.js";

/**
 * Formats an Pi packages row using feature-management-style alignment.
 *
 * @param row Extension row to render.
 * @param extensionColumnWidth Width of the extension id column.
 * @param theme Theme color formatter.
 * @returns Formatted row label.
 */
export function formatManagedExtensionRow(
	row: ManagedExtensionRow,
	extensionColumnWidth: number,
	theme: { fg(color: string, value: string): string },
): string {
	const details = row.rowType === "package" && row.source ? ` · ${row.source}` : row.rowType === "search" ? " · npm search" : "";
	return [
		padManagedExtensionColumn(row.id, extensionColumnWidth),
		`› ${colorManagedExtensionStatus(row.status, theme)}${theme.fg("dim", details)}`,
	].join("  ");
}
