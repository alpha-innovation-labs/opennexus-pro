import type { InternalSlashHandler } from "./types.js";
import { showOAuthLoginDialog } from "./showOAuthLoginDialog.js";

/**
 * Logs into one OAuth provider without opening Pi's built-in selector.
 *
 * @param args Command arguments.
 * @param ctx Command context.
 * @param pi Extension API.
 */
export const handleInternalLoginCommand: InternalSlashHandler = async (args, ctx, pi) => {
  const providerId = args.trim();
  if (!providerId) {
    ctx.ui.notify("Missing provider.", "error");
    return;
  }
  await showOAuthLoginDialog(providerId, ctx, pi);
};
