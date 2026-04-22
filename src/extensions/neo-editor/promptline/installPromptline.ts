import { subscribeUsageSnapshots } from "../../../pi-slash-usage/index.js";
import type { PromptlineContext, PromptlineDeps } from "./types.js";
import { PromptlineEditor } from "./PromptlineEditor.js";
import { refreshGitState } from "../git/refreshGitState.js";
import { refreshTransportPreference } from "../transport/refreshTransportPreference.js";
import { getUsageRenderUnsubscribe, setPromptlineRenderRequest, setUsageRenderUnsubscribe } from "./state.js";

/**
 * Installs the custom promptline editor for one session context.
 *
 * @param ctx Extension context.
 * @param deps Promptline dependencies.
 */
export function installPromptline(ctx: PromptlineContext, deps: PromptlineDeps): void {
  ctx.ui.setFooter(() => ({
    dispose() {},
    invalidate() {},
    render(): string[] {
      return [];
    },
  }));

  ctx.ui.setEditorComponent((tui, theme, keybindings) => {
    setPromptlineRenderRequest(() => tui.requestRender());
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
    );
  });
}
