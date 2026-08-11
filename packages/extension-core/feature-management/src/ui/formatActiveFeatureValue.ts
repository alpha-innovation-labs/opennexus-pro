import { padFeatureColumn } from "./padFeatureColumn";

/**
 * Formats one focused or unfocused feature-management value column.
 *
 * @param value Pre-rendered value text.
 * @param width Target visible column width.
 * @param active Whether this value's menu item is focused.
 * @returns Padded value with a focus marker column.
 */
export function formatActiveFeatureValue(
	value: string,
	width: number,
	active: boolean,
): string {
	return `${active ? "›" : " "} ${padFeatureColumn(value, width)}`;
}
