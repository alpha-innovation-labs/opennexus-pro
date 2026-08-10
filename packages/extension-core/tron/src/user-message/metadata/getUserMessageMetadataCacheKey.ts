import { formatUserMessageTime } from "./formatUserMessageTime";
import type { UserMessageMetadata } from "./types";

/**
 * Builds the render-cache key for user-message timestamp metadata.
 *
 * @param metadata Metadata that affects rendered bubble labels.
 * @returns Stable cache key segment.
 */
export function getUserMessageMetadataCacheKey(metadata: UserMessageMetadata | undefined): string {
  if (!metadata) return "";
  return formatUserMessageTime(metadata.timestamp, metadata.now);
}
