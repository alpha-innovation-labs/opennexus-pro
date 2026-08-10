import type { ExtensionContext } from "@earendil-works/pi-coding-agent";
import { createResumeLeaves } from "../createResumeLeaves.js";
import type { SlashMenuLeaf } from "../types.js";
import { listResumeSessions } from "./listResumeSessions.js";
import type { ResumeScope } from "./ResumeScope.js";

/**
 * Returns cached resume leaves for one source, loading them once per modal session.
 *
 * @param cache Mutable resume leaf cache keyed by source.
 * @param ctx Extension context.
 * @param scope Resume source to load.
 * @returns Cached or freshly loaded resume leaves.
 */
export async function getCachedResumeLeaves(
  cache: Map<ResumeScope, SlashMenuLeaf[]>,
  ctx: ExtensionContext,
  scope: ResumeScope,
): Promise<SlashMenuLeaf[]> {
  const cached = cache.get(scope);
  if (cached) return cached;
  const leaves = createResumeLeaves(await listResumeSessions(ctx, scope));
  cache.set(scope, leaves);
  return leaves;
}
