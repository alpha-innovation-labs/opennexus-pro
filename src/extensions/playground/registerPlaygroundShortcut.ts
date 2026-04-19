import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import type { PlaygroundState } from "./types.js";
import { showPlayground } from "./ui/showPlayground.js";

/**
 * Registers the playground overlay shortcut.
 *
 * @param pi Pi extension API.
 * @param state Playground runtime state.
 */
export function registerPlaygroundShortcut(pi: ExtensionAPI, state: PlaygroundState): void {
	pi.registerShortcut("ctrl+i", {
		description: "Open the playground Pi child-session modal",
		handler: async (ctx) => {
			await showPlayground(state, ctx);
		},
	});
}
