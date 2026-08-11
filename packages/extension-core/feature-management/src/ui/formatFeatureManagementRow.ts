import type { FeatureStatusRow } from "../model/types";
import { colorFeatureStatus } from "./colorFeatureStatus";
import { formatActiveFeatureValue } from "./formatActiveFeatureValue";
import { padFeatureColumn } from "./padFeatureColumn";

const STATUS_COLUMN_WIDTH = "disabled".length;

/**
 * Formats a feature-management row: <name>  > <status>.
 * Columns are aligned using the computed max feature-name width.
 *
 * @param row Feature row to format.
 * @param theme Theme color formatter.
 * @param featureColumnWidth Maximum visible width of the feature-name column.
 * @returns One single-line row label.
 */
export function formatFeatureManagementRow(
	row: FeatureStatusRow,
	theme: { fg(color: string, value: string): string },
	featureColumnWidth: number,
): string {
	return [
		padFeatureColumn(row.feature, featureColumnWidth),
		formatActiveFeatureValue(
			colorFeatureStatus(row.status, theme),
			STATUS_COLUMN_WIDTH,
			true,
		),
	].join("  ");
}
