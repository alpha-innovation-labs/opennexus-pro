/**
 * Returns whether Tron tool grouping is enabled.
 *
 * This experiment keeps compact tool rendering active while disabling
 * cross-tool grouping and thinking-to-tool attachment behavior.
 *
 * @returns False while grouping is experimentally disabled.
 */
export function isToolGroupingEnabled(): boolean {
	return false;
}
