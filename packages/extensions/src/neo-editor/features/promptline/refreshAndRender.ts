import { refreshUsageForContext } from "@nexus/extensions/usage-meter/index.js";
import { logExtensionEvent } from "@nexus/observability/startup-debug.js";
import { refreshGitState } from "../../shared/git/refreshGitState.js";
import { refreshTransportPreference } from "../../shared/transport/refreshTransportPreference.js";
import { getPromptlineRenderRequest } from "./state.js";
import type { PromptlineContext, PromptlineRefreshDeps } from "./types.js";

/**
 * Refreshes promptline data sources and requests a re-render.
 *
 * @param ctx Extension context.
 * @param deps Refresh dependencies.
 */
export async function refreshAndRender(ctx: PromptlineContext, deps: PromptlineRefreshDeps): Promise<void> {
  logExtensionEvent("neo-editor", "refreshAndRender:start", {
    sessionFile: ctx.sessionManager.getSessionFile() ?? null,
  });
  await Promise.all([
    refreshGitState(deps.exec),
    refreshTransportPreference(ctx.cwd),
    refreshUsageForContext(ctx, true),
  ]);
  getPromptlineRenderRequest()?.();
  logExtensionEvent("neo-editor", "refreshAndRender:done", {
    sessionFile: ctx.sessionManager.getSessionFile() ?? null,
  });
}
