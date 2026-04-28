import { runExtensionAuthImportFlow } from "@nexus/pi-platform/login-import/flow/runExtensionAuthImportFlow.js";
import type { AuthImportSource } from "@nexus/pi-platform/login-import/model/AuthImportSource.js";
import type { InternalSlashHandler } from "./types.js";

const authImportSources = new Set<AuthImportSource>(["pi", "opencode"]);

/**
 * Imports provider credentials from a supported local auth source.
 *
 * @param args Command arguments.
 * @param ctx Command context.
 */
export const handleInternalLoginImportCommand: InternalSlashHandler = async (args, ctx) => {
	const source = args.trim() as AuthImportSource;
	if (!authImportSources.has(source)) {
		ctx.ui.notify("Missing import source.", "error");
		return;
	}
	await runExtensionAuthImportFlow(ctx, source);
};
