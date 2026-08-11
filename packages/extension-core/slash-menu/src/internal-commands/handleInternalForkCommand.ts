import { extractForkSelectedText } from "./extractForkSelectedText";
import type { InternalSlashHandler } from "./types";

/**
 * Forks from one selected entry without opening Pi's built-in fork selector.
 *
 * @param args Command arguments.
 * @param ctx Command context.
 */
export const handleInternalForkCommand: InternalSlashHandler = async (
	args,
	ctx,
) => {
	const entryId = args.trim();
	if (!entryId) {
		ctx.ui.notify("Missing fork entry.", "error");
		return;
	}
	const selectedText = extractForkSelectedText(
		ctx.sessionManager.getEntry(entryId),
	);
	await ctx.fork(entryId, {
		async withSession(ctx) {
			ctx.ui.setEditorText(selectedText);
			ctx.ui.notify("Forked to new session", "info");
		},
	});
};
