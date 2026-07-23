import type { FeatureStatusRow } from "../model/types.js";
import { colorFeatureStatus } from "./colorFeatureStatus.js";
import { formatActiveFeatureValue } from "./formatActiveFeatureValue.js";
import { padFeatureColumn } from "./padFeatureColumn.js";

const STATUS_COLUMN_WIDTH = "disabled".length;

/**
 * Formats a feature-management row: <name>  > <status>.
 * Same design as before, just without the channel column.
 *
 * @param row Feature row to format.
 * @param theme Theme color formatter.
 * @returns One single-line row label.
 */
export function formatFeatureManagementRow(
	row: FeatureStatusRow,
	theme: { fg(color: string, value: string): string },
): string {
	return [
		padFeatureColumn(row.feature, STATUS_COLUMN_WIDTH + 2),
		formatActiveFeatureValue(colorFeatureStatus(row.status, theme), STATUS_COLUMN_WIDTH, true),
	].join("  ");
}
