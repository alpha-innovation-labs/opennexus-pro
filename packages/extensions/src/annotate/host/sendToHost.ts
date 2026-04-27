import type { AnnotateRuntimeState } from "../runtime/types.js";

/**
 * Sends a JSON message to the native host over the active socket.
 *
 * @param state Annotate runtime state.
 * @param msg Serializable message payload.
 */
export function sendToHost(state: AnnotateRuntimeState, msg: object): void {
  if (state.browserSocket && !state.browserSocket.destroyed) {
    state.browserSocket.write(`${JSON.stringify(msg)}\n`);
  }
}
