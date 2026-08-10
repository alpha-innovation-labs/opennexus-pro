import { decodeBase64Arg } from "./decodeBase64Arg";
import type { InternalSlashHandler } from "./types";

/**
 * Switches to a selected session path without opening Pi's built-in resume selector.
 *
 * @param args Command arguments.
 * @param ctx Command context.
 */
export const handleInternalResumeCommand: InternalSlashHandler = async (args, ctx) => {
  const sessionPath = decodeBase64Arg(args.trim());
  await ctx.switchSession(sessionPath, {
    async withSession(ctx) {
      ctx.ui.notify("Resumed session", "info");
    },
  });
};
