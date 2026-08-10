import { visibleWidth } from "@earendil-works/pi-tui";
import type { ManagedExtensionRow } from "../model/types";

/**
 * Computes the extension id column width used for aligned rows.
 *
 * @param rows Extension rows to render.
 * @returns Maximum visible extension id width.
 */
export function getManagedExtensionColumnWidth(rows: ManagedExtensionRow[]): number {
	return rows.reduce((width, row) => Math.max(width, visibleWidth(row.id)), 0);
}
