import { subscribeUsageSnapshots } from "@nexus/extensions/slashusage/index.js";
import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";
import { refreshGitState } from "../neo-editor/shared/git/refreshGitState.js";
import { refreshTransportPreference } from "../neo-editor/shared/transport/refreshTransportPreference.js";
import { installPromptlineFooter } from "../neo-editor/features/promptline/installPromptlineFooter.js";
import { getUsageRenderUnsubscribe, setPromptlineRenderRequest, setUsageRenderUnsubscribe } from "../neo-editor/features/promptline/state.js";
import type { PromptQueueController } from "./PromptQueueController.js";
import type { PromptlineConfig } from "../neo-editor/features/promptline/config/types.js";

export type PromptQueueEditorDeps = {
  exec: ExtensionAPI["exec"];
  getThinkingLevel: ExtensionAPI["getThinkingLevel"];
  setThinkingLevel: ExtensionAPI["setThinkingLevel"];
  getSessionName: ExtensionAPI["getSessionName"];
  getCommands: ExtensionAPI["getCommands"];
  getPromptlineConfig: () => PromptlineConfig;
  refreshPromptlineConfig: (cwd: string) => Promise<PromptlineConfig>;
  promptQueue: PromptQueueController;
  isAgentIdle: () => boolean;
};

/**
 * Installs the prompt queue editor wrapper for one UI session.
 *
 * @param ctx Extension context.
 * @param deps Prompt queue editor dependencies.
 */
export async function installPromptQueueEditor(ctx: ExtensionContext, deps: PromptQueueEditorDeps): Promise<void> {
  installPromptlineFooter(ctx);
  const { QueuedPromptlineEditor } = await import("./QueuedPromptlineEditor.js");
  ctx.ui.setEditorComponent((tui, theme, keybindings) => {
    setPromptlineRenderRequest((force = false) => tui.requestRender(force));
    getUsageRenderUnsubscribe()?.();
    setUsageRenderUnsubscribe(subscribeUsageSnapshots(() => tui.requestRender()));
    void refreshGitState(deps.exec).then(() => tui.requestRender());
    void refreshTransportPreference(ctx.cwd).then(() => tui.requestRender());
    return new QueuedPromptlineEditor(tui, theme, keybindings, ctx, ctx.ui.theme, deps.getThinkingLevel, deps.setThinkingLevel, deps.getSessionName, deps.getPromptlineConfig, deps.refreshPromptlineConfig, deps.promptQueue, deps.isAgentIdle, deps.getCommands);
  });
}
