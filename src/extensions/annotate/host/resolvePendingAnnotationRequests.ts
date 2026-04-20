import type { AnnotateRuntimeState } from "../runtime/types.js";
import type { AnnotationResult } from "../types.js";

/**
 * Resolves every pending annotation request with the same result payload.
 *
 * @param state Annotate runtime state.
 * @param result Result sent to all pending handlers.
 */
export async function resolvePendingAnnotationRequests(
  state: AnnotateRuntimeState,
  result: AnnotationResult,
): Promise<void> {
  for (const [, resolvePending] of state.pendingRequests) {
    await resolvePending(result);
  }

  state.pendingRequests.clear();
}
