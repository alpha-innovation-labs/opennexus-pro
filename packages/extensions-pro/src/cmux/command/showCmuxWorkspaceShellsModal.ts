import type { ExtensionCommandContext } from "@earendil-works/pi-coding-agent";
import { saveCmuxSessionSnapshot } from "../snapshots/saveCmuxSessionSnapshot.js";
import { loadCmuxWorkspaceShellText } from "./loadCmuxWorkspaceShellText.js";
import { showCmuxSavedSessionsModal } from "./showCmuxSavedSessionsModal.js";
import { showCmuxWorkspaceShellRootModal } from "./showCmuxWorkspaceShellRootModal.js";

/**
 * Opens the cmux workspace shell modal, falling back to stdout without UI.
 *
 * @param ctx Extension command context.
 */
export async function showCmuxWorkspaceShellsModal(ctx: ExtensionCommandContext): Promise<void> {
	if (!ctx.hasUI) {
		console.log(await loadCmuxWorkspaceShellText());
		return;
	}

	for (;;) {
		const action = await showCmuxWorkspaceShellRootModal(ctx);
		if (action === undefined) return;

		if (action === "save") {
			const name = await ctx.ui.input("Save cmux session snapshot", "Name");
			if (!name?.trim()) return;
			await saveCmuxSessionSnapshot(name.trim());
			ctx.ui.notify(`Saved cmux session: ${name.trim()}`, "info");
			return;
		}

		if (action === "load") {
			const loadAction = await showCmuxSavedSessionsModal(ctx);
			if (loadAction === "back") continue;
			return;
		}
	}
}
