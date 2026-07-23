import { connectToAnnotateHost } from "../host/connectToAnnotateHost.js";
import { sendToHost } from "../host/sendToHost.js";
import { setCurrentAnnotateContext } from "../runtime/setCurrentAnnotateContext.js";
import type { AnnotateExecutionContext, AnnotateRuntimeState } from "../runtime/types.js";

/**
 * Creates the /annotate command handler.
 *
 * @param state Annotate runtime state.
 * @returns Command handler.
 */
export function createAnnotateCommandHandler(state: AnnotateRuntimeState) {
  return async (args: string, ctx: AnnotateExecutionContext): Promise<void> => {
    setCurrentAnnotateContext(state, ctx);
    const url = args.trim() || undefined;

    try {
      await connectToAnnotateHost(state);
    } catch {
      ctx.ui?.notify?.(
        "Chrome extension not connected. Click the Nexus Annotate icon in Chrome to wake the service worker, then retry.",
        "error",
      );
      return;
    }

    const requestId = Date.now();
    sendToHost(state, { type: "START_ANNOTATION", requestId, url });
    ctx.ui?.notify?.(
      url ? `Opening annotation mode on ${url}` : "Annotation mode started on current tab",
      "info",
    );
  };
}
