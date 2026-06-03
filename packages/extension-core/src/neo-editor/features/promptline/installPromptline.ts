import { subscribeUsageSnapshots } from "@nexus/extensions/slashusage/index.js";
import type { PromptlineContext, PromptlineDeps } from "./types.js";
import { PromptlineEditor } from "./PromptlineEditor.js";
import { refreshGitState } from "../../shared/git/refreshGitState.js";
import { refreshTransportPreference } from "../../shared/transport/refreshTransportPreference.js";
import { installPromptlineFooter } from "./installPromptlineFooter.js";
import { installPromptlineRenderScheduler } from "./installPromptlineRenderScheduler.js";
import { getUsageRenderUnsubscribe, setPromptlineRenderRequest, setUsageRenderUnsubscribe } from "./state.js";

/**
 * Installs the custom promptline editor for one session context.
 *
 * @param ctx Extension context.
 * @param deps Promptline dependencies.
 */
export function installPromptline(ctx: PromptlineContext, deps: PromptlineDeps): void {
  installPromptlineFooter(ctx);

  ctx.ui.setEditorComponent((tui, theme, keybindings) => {
    installPromptlineRenderScheduler(tui);
    setPromptlineRenderRequest((force = false) => tui.requestRender(force));
    getUsageRenderUnsubscribe()?.();
    setUsageRenderUnsubscribe(subscribeUsageSnapshots(() => tui.requestRender()));
    void refreshGitState(deps.exec).then(() => tui.requestRender());
    void refreshTransportPreference(ctx.cwd).then(() => tui.requestRender());
    return new PromptlineEditor(
      tui,
      theme,
      keybindings,
      ctx,
      ctx.ui.theme,
      deps.getThinkingLevel,
      deps.setThinkingLevel,
      deps.getSessionName,
      deps.getPromptlineConfig,
      deps.refreshPromptlineConfig,
      deps.getCommands,
      deps.getAllTools,
    );
  });
}
