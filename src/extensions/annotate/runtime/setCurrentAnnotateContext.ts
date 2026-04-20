import type { AnnotateExecutionContext, AnnotateRuntimeState } from "./types.js";

/**
 * Stores the current execution context for later status updates.
 *
 * @param state Annotate runtime state.
 * @param ctx Current command or tool context.
 */
export function setCurrentAnnotateContext(
  state: AnnotateRuntimeState,
  ctx: AnnotateExecutionContext,
): void {
  state.currentCtx = ctx;
}
