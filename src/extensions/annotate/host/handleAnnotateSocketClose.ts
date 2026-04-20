import { clearConnectionState } from "./clearConnectionState.js";
import { createCancelledAnnotationResult } from "./createCancelledAnnotationResult.js";
import { resolvePendingAnnotationRequests } from "./resolvePendingAnnotationRequests.js";
import { setAnnotateStatus } from "./setAnnotateStatus.js";
import type { AnnotateRuntimeState } from "../runtime/types.js";

/**
 * Handles socket shutdown and fails any pending annotation requests.
 *
 * @param state Annotate runtime state.
 */
export async function handleAnnotateSocketClose(state: AnnotateRuntimeState): Promise<void> {
  setAnnotateStatus(state, "Disconnected from native host");
  clearConnectionState(state);
  await resolvePendingAnnotationRequests(state, createCancelledAnnotationResult("connection_lost"));
}
