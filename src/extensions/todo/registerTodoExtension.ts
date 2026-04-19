import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { createTodoExtensionState } from "./runtime/createTodoExtensionState.js";
import { showTodoModal } from "./runtime/showTodoModal.js";

/**
 * Registers the todo modal extension and shortcut.
 *
 * @param pi Pi extension API.
 */
export function registerTodoExtension(pi: ExtensionAPI): void {
	const state = createTodoExtensionState();
	pi.registerShortcut("ctrl+\\", {
		description: "Open the todo modal",
		handler: async (ctx) => {
			await showTodoModal(state, ctx);
		},
	});
}
