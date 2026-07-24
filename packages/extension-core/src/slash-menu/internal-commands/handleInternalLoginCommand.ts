import type { InternalSlashHandler } from "./types.js";

/**
 * Handles the /login-select command. The /login menu now displays "hello world"
 * as its only option. Selecting it shows an info notification.
 *
 * @param args Command arguments.
 * @param ctx Command context.
 * @param pi Extension API.
 */
export const handleInternalLoginCommand: InternalSlashHandler = async (args, ctx) => {
  const providerId = args.trim();
  if (!providerId) {
    ctx.ui.notify("Missing provider.", "error");
    return;
  }
  if (providerId === "hello-world") {
    ctx.ui.notify("hello world", "info");
    return;
  }
  ctx.ui.notify(`Unknown provider: ${providerId}`, "error");
};
