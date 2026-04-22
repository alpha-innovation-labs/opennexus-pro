import { decodeBase64Arg } from "./decodeBase64Arg.js";
import type { InternalSlashHandler } from "./types.js";

/**
 * Navigates the session tree from a selected slash-menu leaf.
 *
 * @param args Command arguments.
 * @param ctx Command context.
 */
export const handleInternalTreeCommand: InternalSlashHandler = async (args, ctx) => {
  const [entryId, summarizeFlag = "false", encodedInstructions = ""] = args.trim().split(" ");
  if (!entryId) {
    ctx.ui.notify("Missing tree entry.", "error");
    return;
  }
  const customInstructions = encodedInstructions ? decodeBase64Arg(encodedInstructions) : undefined;
  const result = await ctx.navigateTree(entryId, {
    summarize: summarizeFlag === "true",
    customInstructions,
  });
  if (!result.cancelled) {
    ctx.ui.notify(result.aborted ? "Branch summarization cancelled" : "Navigated session tree", result.aborted ? "warning" : "info");
  }
};
