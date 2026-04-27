import type { FeatureManagementControl, FeatureStatusRow } from "../model/types.js";
import { colorFeatureChannel } from "./colorFeatureChannel.js";
import { colorFeatureStatus } from "./colorFeatureStatus.js";
import { formatActiveFeatureValue } from "./formatActiveFeatureValue.js";
import { padFeatureColumn } from "./padFeatureColumn.js";

const STATUS_COLUMN_WIDTH = "disabled".length;
const CHANNEL_COLUMN_WIDTH = "production".length;

/**
 * Formats a feature-management row with aligned current-value selection controls.
 *
 * @param row Feature row to format.
 * @param activeControl Currently focused control group.
 * @param featureColumnWidth Width of the feature-name column.
 * @param theme Theme color formatter.
 * @returns One single-line row label.
 */
export function formatFeatureManagementRow(
	row: FeatureStatusRow,
	activeControl: FeatureManagementControl,
	featureColumnWidth: number,
	theme: { fg(color: string, value: string): string },
): string {
	return [
		padFeatureColumn(row.feature, featureColumnWidth),
		formatActiveFeatureValue(colorFeatureStatus(row.status, theme), STATUS_COLUMN_WIDTH, activeControl === "status"),
		formatActiveFeatureValue(colorFeatureChannel(row.channel, theme), CHANNEL_COLUMN_WIDTH, activeControl === "channel"),
	].join("  ");
}
