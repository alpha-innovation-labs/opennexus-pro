import { Type } from "@sinclair/typebox";
import { connectToAnnotateHost } from "../host/connectToAnnotateHost.js";
import { formatResult } from "../format/formatResult.js";
import { sendToHost } from "../host/sendToHost.js";
import { setCurrentAnnotateContext } from "../runtime/setCurrentAnnotateContext.js";
import type { AnnotateExecutionContext, AnnotateRuntimeState } from "../runtime/types.js";
import { createToolAbortResult } from "./createToolAbortResult.js";
import { createToolConnectionFailureResult } from "./createToolConnectionFailureResult.js";
import { createToolTimeoutResult } from "./createToolTimeoutResult.js";

/**
 * Creates the annotate tool definition.
 *
 * @param state Annotate runtime state.
 * @returns Pi tool definition.
 */
export function createAnnotateTool(state: AnnotateRuntimeState) {
  return {
    name: "annotate",
    label: "Annotate",
    description:
      "Open visual annotation mode in Chrome so the user can click/select elements and add comments. " +
      "Only use when the user explicitly asks to annotate, visually point something out, or show you UI issues. " +
      "Returns structured annotations with CSS selectors and element info. " +
      "If no URL is provided, uses the current active Chrome tab.",
    promptSnippet:
      "Use only when the user explicitly asks for visual annotation or UI pointing. Call with {url?} and return selected element annotations.",
    parameters: Type.Object({
      url: Type.Optional(
        Type.String({
          description: "URL to annotate. If omitted, uses current Chrome tab.",
        }),
      ),
      timeout: Type.Optional(
        Type.Number({
          description: "Max seconds to wait for annotations. Default: 300 (5 min)",
        }),
      ),
    }),
    async execute(
      _toolCallId: string,
      params: unknown,
      signal: AbortSignal | undefined,
      _onUpdate: unknown,
      ctx: AnnotateExecutionContext,
    ) {
      setCurrentAnnotateContext(state, ctx);
      const { url, timeout = 300 } = params as { url?: string; timeout?: number };
      const requestId = Date.now();

      try {
        await connectToAnnotateHost(state);
      } catch {
        return createToolConnectionFailureResult();
      }

      return await new Promise((resolve) => {
        let timeoutId: NodeJS.Timeout | null = null;

        const cleanup = (): void => {
          if (timeoutId) {
            clearTimeout(timeoutId);
          }
          state.pendingRequests.delete(requestId);
          signal?.removeEventListener("abort", onAbort);
        };

        const onAbort = (): void => {
          cleanup();
          sendToHost(state, { type: "CANCEL", requestId, reason: "aborted" });
          resolve(createToolAbortResult());
        };

        if (signal?.aborted) {
          resolve(createToolAbortResult());
          return;
        }

        signal?.addEventListener("abort", onAbort);
        state.pendingRequests.set(requestId, async (result) => {
          cleanup();
          resolve({
            content: [{ type: "text" as const, text: await formatResult(result) }],
            details: result,
          });
        });

        timeoutId = setTimeout(() => {
          cleanup();
          sendToHost(state, { type: "CANCEL", requestId, reason: "timeout" });
          resolve(createToolTimeoutResult(timeout));
        }, timeout * 1000);

        sendToHost(state, { type: "START_ANNOTATION", requestId, url });
        if (ctx.hasUI) {
          ctx.ui?.notify?.("Annotation mode started in Chrome", "info");
        }
      });
    },
  };
}
