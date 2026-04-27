import { visibleWidth } from "@mariozechner/pi-tui";

/**
 * Pads a feature label so following controls align in a vertical column.
 *
 * @param feature Feature label to render.
 * @param width Target visible column width.
 * @returns Feature label padded to the requested width.
 */
export function padFeatureColumn(feature: string, width: number): string {
	return `${feature}${" ".repeat(Math.max(0, width - visibleWidth(feature)))}`;
}
