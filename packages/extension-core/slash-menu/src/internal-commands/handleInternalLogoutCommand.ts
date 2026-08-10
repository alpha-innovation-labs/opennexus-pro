import { logoutProvider } from "../model/logoutProvider";
import type { InternalSlashHandler } from "./types";

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
  logoutProvider(ctx, providerId);
  ctx.ui.notify(`Logged out of ${providerId}`, "info");
};
