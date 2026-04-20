import { isAnnotationResult } from "../guards/isAnnotationResult.js";
import { isRecord } from "../guards/isRecord.js";
import { formatResult } from "../format/formatResult.js";
import type { AnnotateRuntimeState } from "../runtime/types.js";
import { createCancelledAnnotationResult } from "./createCancelledAnnotationResult.js";
import { resolvePendingAnnotationRequests } from "./resolvePendingAnnotationRequests.js";
import { setAnnotateStatus } from "./setAnnotateStatus.js";

/**
 * Handles messages received from the native host.
 *
 * @param state Annotate runtime state.
 * @param msg Decoded host message.
 */
export async function handleAnnotateMessage(
  state: AnnotateRuntimeState,
  msg: unknown,
): Promise<void> {
  if (!isRecord(msg) || typeof msg.type !== "string") {
    return;
  }

  setAnnotateStatus(state, `Received: ${msg.type}`);
  const requestId = typeof msg.requestId === "number" ? msg.requestId : null;

  if (msg.type === "SESSION_REPLACED") {
    const reason = typeof msg.reason === "string" ? msg.reason : "Session replaced by another terminal";
    setAnnotateStatus(state, "Session replaced by another terminal");
    await resolvePendingAnnotationRequests(state, createCancelledAnnotationResult(reason));
    state.browserSocket = null;
    state.dataBuffer = "";
    return;
  }

  if (msg.type === "ANNOTATIONS_COMPLETE") {
    if (!isAnnotationResult(msg.result)) {
      return;
    }

    if (requestId && state.pendingRequests.has(requestId)) {
      const resolvePending = state.pendingRequests.get(requestId);
      state.pendingRequests.delete(requestId);
      await resolvePending?.(msg.result);
      return;
    }

    const text = await formatResult(msg.result);
    setAnnotateStatus(state, "Annotation complete");
    state.pi.sendUserMessage(text);
    return;
  }

  if (msg.type === "CANCEL" && requestId && state.pendingRequests.has(requestId)) {
    const resolvePending = state.pendingRequests.get(requestId);
    state.pendingRequests.delete(requestId);
    await resolvePending?.(
      createCancelledAnnotationResult(typeof msg.reason === "string" ? msg.reason : "user"),
    );
  }
}
