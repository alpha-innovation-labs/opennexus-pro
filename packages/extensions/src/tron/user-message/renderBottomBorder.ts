import { visibleWidth } from "@mariozechner/pi-tui";
import { colorSecondaryText } from "../colors/colorSecondaryText.ts";
import { colorBorder } from "./colorBorder.ts";
import { formatUserMessageTime } from "./metadata/formatUserMessageTime.ts";
import type { UserMessageMetadata } from "./metadata/types.ts";

/**
 * Renders the bottom border with the user-message timestamp on the right.
 *
 * @param innerWidth Width between border corners.
 * @param metadata Timestamp metadata for the user message.
 * @returns Styled bottom-border line.
 */
export function renderBottomBorder(innerWidth: number, metadata?: UserMessageMetadata): string {
  const time = formatUserMessageTime(metadata?.timestamp, metadata?.now);
  if (!time) return colorBorder(`╰${"─".repeat(innerWidth)}╯`);

  const timeSegment = ` ${colorSecondaryText(time)} `;
  const fillWidth = Math.max(0, innerWidth - visibleWidth(timeSegment));
  return `${colorBorder("╰")}${colorBorder("─".repeat(fillWidth))}${timeSegment}${colorBorder("╯")}`;
}
