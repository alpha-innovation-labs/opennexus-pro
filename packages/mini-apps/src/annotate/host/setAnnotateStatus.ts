import type { AnnotateRuntimeState } from "../runtime/types.js";

/**
 * Pushes a status message into the active Pi UI when available.
 *
 * @param state Annotate runtime state.
 * @param message Status text.
 */
export function setAnnotateStatus(state: AnnotateRuntimeState, message: string): void {
  state.currentCtx?.ui?.setStatus?.("pi-annotate", message);
}
