import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { registerEvalRefreshCommand } from "./command/registerEvalRefreshCommand.js";
import { registerEvalToggleCommand } from "./command/registerEvalToggleCommand.js";
import { startSmartEvalBackgroundRun } from "./runtime/startSmartEvalBackgroundRun.js";
import { clearSmartEvalState } from "./state/smartEvalState.js";

/**
 * Registers smart-eval for historical conversation turns.
 *
 * @param pi Extension API.
 */
export function registerSmartEvalExtension(pi: ExtensionAPI): void {
	registerEvalToggleCommand(pi);
	registerEvalRefreshCommand(pi);
	pi.on("session_start", async (_event, ctx) => {
		await startSmartEvalBackgroundRun(ctx);
	});
	pi.on("session_shutdown", async () => {
		clearSmartEvalState();
	});
}
