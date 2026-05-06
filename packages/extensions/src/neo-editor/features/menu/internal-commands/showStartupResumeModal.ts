import type { ExtensionContext } from "@mariozechner/pi-coding-agent";
import { createPanelOverlayOptions } from "../../../../overlay/createPanelOverlayOptions.js";
import { ensureSubmitTrigger } from "../../editor-triggers/ensureSubmitTrigger.js";
import { refreshPromptlineConfig } from "../../promptline/config/refreshPromptlineConfig.js";
import { SlashMenuModal } from "../SlashMenuModal.js";

/**
 * Opens the Nexus resume modal during startup instead of Pi's default resume selector.
 *
 * @param ctx Extension context.
 */
export async function showStartupResumeModal(ctx: ExtensionContext): Promise<void> {
  if (!ctx.hasUI) return;

  await ctx.ui.custom<void>((tui, _theme, _keybindings, done) => {
    const modal = new SlashMenuModal(ctx, () => "medium", () => undefined, done, () => tui.requestRender(), (commandText) => {
      void (async () => {
        await ensureSubmitTrigger(ctx.cwd, commandText);
        await refreshPromptlineConfig(ctx.cwd);
        done();
        ctx.ui.setEditorText(commandText);
      })();
    });
    void modal.openLevel("resume");
    return modal;
  }, {
    overlay: true,
    overlayOptions: createPanelOverlayOptions(80, "100%"),
  });
}
