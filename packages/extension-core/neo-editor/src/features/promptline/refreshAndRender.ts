import { logExtensionEvent } from "@nexus/observability/startup-debug";
import { refreshGitState } from "../../shared/git/refreshGitState";
import { refreshTransportPreference } from "../../shared/transport/refreshTransportPreference";
import { getPromptlineRenderRequest } from "./state";
import type { PromptlineContext, PromptlineRefreshDeps } from "./types";

/**
 * Refreshes promptline data sources and requests a re-render.
 *
 * @param ctx Extension context.
 * @param deps Refresh dependencies.
 */
export async function refreshAndRender(
	ctx: PromptlineContext,
	deps: PromptlineRefreshDeps,
): Promise<void> {
	logExtensionEvent("neo-editor", "refreshAndRender:start", {
		sessionFile: ctx.sessionManager.getSessionFile() ?? null,
	});
	getPromptlineRenderRequest()?.();
	void Promise.all([
		refreshGitState(deps.exec),
		refreshTransportPreference(ctx.cwd),
		Promise.resolve(), // slashusage archived
	])
		.then(() => {
			getPromptlineRenderRequest()?.();
			logExtensionEvent("neo-editor", "refreshAndRender:done", {
				sessionFile: ctx.sessionManager.getSessionFile() ?? null,
			});
		})
		.catch((error: unknown) => {
			logExtensionEvent("neo-editor", "refreshAndRender:error", {
				message: error instanceof Error ? error.message : String(error),
			});
			getPromptlineRenderRequest()?.();
		});
}
