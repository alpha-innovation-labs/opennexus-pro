import type { InternalSlashHandler } from "./types.js";

/**
 * Forks from one selected entry without opening Pi's built-in fork selector.
 *
 * @param args Command arguments.
 * @param ctx Command context.
 */
export const handleInternalForkCommand: InternalSlashHandler = async (args, ctx) => {
  const entryId = args.trim();
  if (!entryId) {
    ctx.ui.notify("Missing fork entry.", "error");
    return;
  }
  const result = await ctx.fork(entryId);
  if (!result.cancelled) {
    ctx.ui.setEditorText(result.selectedText ?? "");
    ctx.ui.notify("Forked to new session", "info");
  }
};
