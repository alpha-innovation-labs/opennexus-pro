/**
 * Renders a connected tree connector for an outline row.
 *
 * @param isLast Whether this row is the final sibling.
 * @returns Tree connector text.
 */
export function renderOutlineConnector(isLast: boolean): string {
	return isLast ? "└─" : "├─";
}
