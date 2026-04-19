import type { ExtensionContext } from "@mariozechner/pi-coding-agent";
import type { TUI } from "@mariozechner/pi-tui";
import type { TodoExtensionState } from "../model/types.js";
import { readTodoItems } from "../storage/readTodoItems.js";
import { writeTodoItems } from "../storage/writeTodoItems.js";
import { TodoModal } from "../ui/TodoModal.js";
import { closeTodoModal } from "./closeTodoModal.js";

/**
 * Opens or focuses the todo overlay.
 *
 * @param state Todo runtime state.
 * @param ctx Active extension context.
 */
export async function showTodoModal(state: TodoExtensionState, ctx: ExtensionContext): Promise<void> {
	if (!ctx.hasUI) return;
	if (state.overlayHandle && state.activeCwd === ctx.cwd) {
		state.overlayHandle.setHidden(false);
		state.overlayHandle.focus();
		return;
	}
	if (state.overlayHandle) closeTodoModal(state);
	state.activeCwd = ctx.cwd;
	const items = await readTodoItems(ctx.cwd);
	await ctx.ui.custom<void>(
		async (tui: TUI, theme, keybindings, done) => {
			state.finish = () => done();
			return new TodoModal(
				tui,
				theme,
				keybindings,
				items,
				async (nextItems) => writeTodoItems(ctx.cwd, nextItems),
				(message, level) => ctx.ui.notify(message, level),
				() => closeTodoModal(state),
			);
		},
		{
			overlay: true,
			overlayOptions: {
				anchor: "center",
				width: "72%",
				minWidth: 60,
				maxHeight: "80%",
			},
			onHandle: (handle) => {
				state.overlayHandle = handle;
				handle.setHidden(false);
				handle.focus();
			},
		},
	);
}
