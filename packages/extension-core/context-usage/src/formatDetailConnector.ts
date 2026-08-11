/**
 * Formats a connected tree connector for one detail row.
 *
 * @param index Detail row index.
 * @param total Total detail rows.
 * @returns Connected tree connector.
 */
export function formatDetailConnector(index: number, total: number): string {
	return index === total - 1 ? "└─" : "├─";
}
