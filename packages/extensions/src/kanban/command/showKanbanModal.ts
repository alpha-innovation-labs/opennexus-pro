import type { ExtensionCommandContext } from "@mariozechner/pi-coding-agent";
import { createPanelOverlayOptions } from "../../overlay/createPanelOverlayOptions.js";
import { createTempKanbanBoard } from "../data/createTempKanbanBoard.js";
import { KanbanModal } from "../modal/KanbanModal.js";

/**
 * Opens the temporary kanban modal.
 *
 * @param ctx Pi command context.
 */
export async function showKanbanModal(ctx: ExtensionCommandContext): Promise<void> {
	if (!ctx.hasUI) return;
	const board = createTempKanbanBoard();
	await ctx.ui.custom<undefined>(
		(_tui, theme, _keybindings, done) => new KanbanModal(theme, board.inLoopItems, board.detailsByValue, board.completedLines, done),
		{
			overlay: true,
			overlayOptions: createPanelOverlayOptions(80, "85%"),
		},
	);
}
