import { visibleWidth } from "@earendil-works/pi-tui";
import { formatUserMessageTime } from "./metadata/formatUserMessageTime.ts";
import type { UserMessageMetadata } from "./metadata/types.ts";

/**
 * Calculates the preferred inner width for bottom-border timestamp metadata.
 *
 * @param metadata Timestamp metadata for the user message.
 * @returns Preferred width between border corners.
 */
export function getMetadataInnerWidth(metadata?: UserMessageMetadata): number {
  const time = formatUserMessageTime(metadata?.timestamp, metadata?.now);
  return time ? visibleWidth(time) + 3 : 0;
}
