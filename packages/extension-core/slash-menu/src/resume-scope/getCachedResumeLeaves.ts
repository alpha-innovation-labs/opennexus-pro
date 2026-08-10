import type { ExtensionContext } from "@earendil-works/pi-coding-agent";
import { createResumeLeaves } from "../createResumeLeaves";
import type { SlashMenuLeaf } from "../types";
import { listResumeSessions } from "./listResumeSessions";
import type { ResumeScope } from "./ResumeScope";

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
