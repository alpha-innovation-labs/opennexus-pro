import type { AnnotateRuntimeState } from "../runtime/types.js";

/**
 * Clears the transient socket-related runtime state.
 *
 * @param state Annotate runtime state.
 */
export function clearConnectionState(state: AnnotateRuntimeState): void {
  state.browserSocket = null;
  state.authToken = null;
  state.dataBuffer = "";
}
