import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { isSmartEvalExpanded, setSmartEvalExpanded } from "../state/smartEvalState.js";

/**
 * Registers the /eval-toggle command for toggling detailed smart-eval footer output.
 *
 * @param pi Extension API.
 */
export function registerEvalToggleCommand(pi: ExtensionAPI): void {
	pi.registerCommand("eval-toggle", {
		description: "Toggle smart-eval question results for historical assistant turns",
		handler: async (_args, ctx) => {
			const next = !isSmartEvalExpanded();
			setSmartEvalExpanded(next);
			ctx.ui.notify(`Smart eval details ${next ? "expanded" : "collapsed"}.`, "info");
		},
	});
}
