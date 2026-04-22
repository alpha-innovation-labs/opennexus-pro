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
  const changed = await pi.setModel(model);
  if (!changed) {
    ctx.ui.notify(`No configured auth for ${reference}`, "error");
    return;
  }
  ctx.ui.notify(`Model: ${model.id}`, "info");
};
