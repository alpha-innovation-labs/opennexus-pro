import type { ExtensionContext } from "@earendil-works/pi-coding-agent";
import { createPanelOverlayOptions } from "@nexus/tui-kit/modal/createPanelOverlayOptions.js";
import { ensureSubmitTrigger } from "../../neo-editor/features/editor-triggers/ensureSubmitTrigger.js";
import { refreshPromptlineConfig } from "../../neo-editor/features/promptline/config/refreshPromptlineConfig.js";
import { SlashMenuModal } from "../SlashMenuModal.js";
import { registerStartupModalTerminalInputForwarder } from "./registerStartupModalTerminalInputForwarder.js";

/**
 * Opens the Nexus resume modal during startup instead of Pi's default resume selector.
 *
 * @param ctx Extension context.
 */
export async function showStartupResumeModal(ctx: ExtensionContext): Promise<void> {
  if (!ctx.hasUI) return;

  await ctx.ui.custom<void>((tui, _theme, _keybindings, done) => {
    let cleanupInputForwarder: () => void = () => undefined;
    const finish = (): void => {
      cleanupInputForwarder();
      done();
    };
    const modal = new SlashMenuModal(ctx, () => "medium", () => undefined, finish, () => tui.requestRender(), (commandText) => {
      void (async () => {
        await ensureSubmitTrigger(ctx.cwd, commandText);
        await refreshPromptlineConfig(ctx.cwd);
        finish();
        ctx.ui.setEditorText(commandText);
      })();
    });
    cleanupInputForwarder = registerStartupModalTerminalInputForwarder(ctx, modal, () => tui.requestRender());
    void modal.openLevel("resume");
    return modal;
  }, {
    overlay: true,
    overlayOptions: createPanelOverlayOptions(80, "100%"),
  });
}
