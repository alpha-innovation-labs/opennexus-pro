import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import type { AnnotateRuntimeState } from "./types.js";

/**
 * Creates the mutable runtime state used by the annotate extension.
 *
 * @param pi Pi extension API.
 * @returns Fresh annotate runtime state.
 */
export function createAnnotateRuntimeState(pi: ExtensionAPI): AnnotateRuntimeState {
  return {
    pi,
    browserSocket: null,
    pendingRequests: new Map(),
    dataBuffer: "",
    authToken: null,
    currentCtx: null,
  };
}
