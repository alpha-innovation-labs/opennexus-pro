import { SettingsManager } from "@earendil-works/pi-coding-agent";
import { getPromptlineRenderRequest, setPromptlineModelOverride } from "../../neo-editor/features/promptline/state.js";
import { ensureEnabledModelIncludesSelection } from "../model/ensureEnabledModelIncludesSelection.js";
import type { InternalSlashHandler } from "./types.js";

/**
 * Applies one model selection without opening Pi's built-in selector.
 *
 * @param args Command arguments.
 * @param ctx Command context.
 * @param pi Extension API.
 */
export const handleInternalModelCommand: InternalSlashHandler = async (args, ctx, pi) => {
  const reference = args.trim();
  if (!reference) {
    ctx.ui.notify("Missing model reference.", "error");
    return;
  }
  const [provider, ...rest] = reference.split("/");
  const id = rest.join("/");
  const model = ctx.modelRegistry.find(provider, id);
  if (!model) {
    ctx.ui.notify(`Unknown model: ${reference}`, "error");
    return;
  }
  setPromptlineModelOverride(model as never);
  const changed = await pi.setModel(model);
  if (!changed) {
    setPromptlineModelOverride(undefined);
    ctx.ui.notify(`No configured auth for ${reference}`, "error");
    return;
  }
  getPromptlineRenderRequest()?.(true);
  const settings = SettingsManager.create(ctx.cwd);
  const nextEnabledModels = ensureEnabledModelIncludesSelection(settings.getEnabledModels(), reference);
  if (nextEnabledModels) settings.setEnabledModels(nextEnabledModels);
};
