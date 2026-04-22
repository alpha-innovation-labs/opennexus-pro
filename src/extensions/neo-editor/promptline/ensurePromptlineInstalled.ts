import { logExtensionEvent } from "../../shared/observability/startup-debug.ts";
import { installPromptline } from "./installPromptline.js";
import { getPromptlineInstalledForSession, setPromptlineInstalledForSession } from "./state.js";
import type { PromptlineContext, PromptlineDeps } from "./types.js";

/**
 * Ensures the custom promptline is installed once per session file.
 *
 * @param ctx Extension context.
 * @param deps Promptline dependencies.
 */
export function ensurePromptlineInstalled(ctx: PromptlineContext, deps: PromptlineDeps): void {
  const sessionFile = ctx.sessionManager.getSessionFile() ?? "__ephemeral__";
  if (getPromptlineInstalledForSession() === sessionFile) return;
  setPromptlineInstalledForSession(sessionFile);
  logExtensionEvent("neo-editor", "ensurePromptlineInstalled", {
    sessionFile: ctx.sessionManager.getSessionFile() ?? null,
  });
  installPromptline(ctx, deps);
}
