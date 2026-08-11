import type { PromptlineContext, PromptlineDeps } from "./types";
import { PromptlineEditor } from "./PromptlineEditor";
import { refreshGitState } from "../../shared/git/refreshGitState";
import { refreshTransportPreference } from "../../shared/transport/refreshTransportPreference";
import { installPromptlineFooter } from "./installPromptlineFooter";
import { installPromptlineRenderScheduler } from "./installPromptlineRenderScheduler";
import { getUsageRenderUnsubscribe, setPromptlineRenderRequest, setUsageRenderUnsubscribe } from "./state";

/**
 * Installs the custom promptline editor for one session context.
 *
 * @param ctx Extension context.
 * @param deps Promptline dependencies.
 */
export function installPromptline(ctx: PromptlineContext, deps: PromptlineDeps): void {
  installPromptlineFooter(ctx);

  ctx.ui.setEditorComponent((tui, theme, keybindings) => {
    installPromptlineRenderScheduler(tui as Parameters<typeof installPromptlineRenderScheduler>[0]);
    setPromptlineRenderRequest((force = false) => tui.requestRender(force));
    getUsageRenderUnsubscribe()?.();
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
