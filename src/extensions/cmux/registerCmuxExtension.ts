import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { setCmuxTitleSyncEnabled } from "./state/setCmuxTitleSyncEnabled.js";

/**
 * Enables cmux pane-title syncing for the current extension runtime.
 *
 * @param pi Pi extension API.
 */
export function registerCmuxExtension(pi: ExtensionAPI): void {
	setCmuxTitleSyncEnabled(true);
	pi.on("session_shutdown", () => {
		setCmuxTitleSyncEnabled(false);
	});
}
