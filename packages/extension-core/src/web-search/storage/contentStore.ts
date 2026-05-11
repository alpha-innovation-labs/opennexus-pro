import type { StoredContentResult } from "./storedContentTypes.js";

const contentStore = new Map<string, StoredContentResult>();

/**
 * Stores fetched content for later retrieval by get_search_content.
 *
 * @param result Stored result payload.
 */
export function storeContentResult(result: StoredContentResult): void {
  contentStore.set(result.id, result);
}

/**
 * Reads stored fetched content by response id.
 *
 * @param responseId Stored response id.
 * @returns Stored result when available.
 */
export function getContentResult(responseId: string): StoredContentResult | undefined {
  return contentStore.get(responseId);
}
