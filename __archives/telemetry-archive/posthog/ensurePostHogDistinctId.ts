import { createPostHogDistinctId } from "./createPostHogDistinctId.js";
import { getPostHogDistinctIdPath } from "./getPostHogDistinctIdPath.js";
import { readPostHogDistinctId } from "./readPostHogDistinctId.js";
import { writePostHogDistinctId } from "./writePostHogDistinctId.js";

let cachedDistinctId: string | undefined;

/**
 * Reads or creates a stable anonymous PostHog distinct id.
 *
 * @param filePath Optional distinct id file path.
 * @returns Anonymous distinct id.
 */
export async function ensurePostHogDistinctId(filePath = getPostHogDistinctIdPath()): Promise<string> {
  if (cachedDistinctId) return cachedDistinctId;
  const existing = await readPostHogDistinctId(filePath);
  if (existing) {
    cachedDistinctId = existing;
    return existing;
  }
  const created = createPostHogDistinctId();
  cachedDistinctId = created;
  await writePostHogDistinctId(filePath, created);
  return created;
}
