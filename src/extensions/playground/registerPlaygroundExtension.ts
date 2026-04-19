import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { createPlaygroundState } from "./model/createPlaygroundState.js";
import { registerPlaygroundShortcut } from "./registerPlaygroundShortcut.js";
import { closePlayground } from "./ui/closePlayground.js";

/**
 * Registers the playground extension.
 *
 * @param pi Pi extension API.
 */
export function registerPlaygroundExtension(pi: ExtensionAPI): void {
	const state = createPlaygroundState();
	registerPlaygroundShortcut(pi, state);
	pi.on("session_shutdown", async () => {
		await closePlayground(state);
	});
}
