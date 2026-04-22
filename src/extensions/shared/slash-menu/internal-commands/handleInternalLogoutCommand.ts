import type { InternalSlashHandler } from "./types.js";

/**
 * Logs out one OAuth provider without opening Pi's built-in selector.
 *
 * @param args Command arguments.
 * @param ctx Command context.
 */
export const handleInternalLogoutCommand: InternalSlashHandler = async (args, ctx) => {
  const providerId = args.trim();
  if (!providerId) {
    ctx.ui.notify("Missing provider.", "error");
    return;
  }
  ctx.modelRegistry.authStorage.logout(providerId);
  ctx.modelRegistry.refresh();
  ctx.ui.notify(`Logged out of ${providerId}`, "info");
};
