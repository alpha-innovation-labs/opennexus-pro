import { visibleWidth } from "@earendil-works/pi-tui";
import { colorSecondaryText } from "@extensions/tron/colors/colorSecondaryText";
import { colorBorder } from "./colorBorder";
import { formatUserMessageTime } from "./metadata/formatUserMessageTime";
import type { UserMessageMetadata } from "./metadata/types";

/**
 * Renders the bottom border with the user-message timestamp on the right.
 *
 * @param innerWidth Width between border corners.
 * @param metadata Timestamp metadata for the user message.
 * @returns Styled bottom-border line.
 */
export function renderBottomBorder(
	innerWidth: number,
	metadata?: UserMessageMetadata,
): string {
	const time = formatUserMessageTime(metadata?.timestamp, metadata?.now);
	if (!time) return colorBorder(`╰${"─".repeat(innerWidth)}╯`);

	const timeSegment = ` ${colorSecondaryText(time)} `;
	const fillWidth = Math.max(0, innerWidth - visibleWidth(timeSegment));
	return `${colorBorder("╰")}${colorBorder("─".repeat(fillWidth))}${timeSegment}${colorBorder("╯")}`;
}
