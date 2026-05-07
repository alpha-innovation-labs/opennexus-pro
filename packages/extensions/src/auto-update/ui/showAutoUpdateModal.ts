import type { ExtensionContext } from "@mariozechner/pi-coding-agent";
import { createPanelOverlayOptions } from "../../overlay/createPanelOverlayOptions.js";
import { AutoUpdateModal } from "./AutoUpdateModal.js";

export type ShowAutoUpdateModalInput = {
	currentVersion: string;
	latestVersion: string;
	packageName: string;
};

/**
 * Shows the interactive auto-update modal and resolves the user's choice.
 *
 * @param ctx Extension context with UI access.
 * @param input Version and package values displayed in the modal.
 * @returns True when the user chooses to install the update.
 */
export async function showAutoUpdateModal(ctx: ExtensionContext, input: ShowAutoUpdateModalInput): Promise<boolean> {
	if (!ctx.hasUI) return false;
	return ctx.ui.custom<boolean>((tui, theme, _keybindings, done) => new AutoUpdateModal({
		...input,
		onCancel: () => done(false),
		onConfirm: () => done(true),
		theme,
	}), {
		overlay: true,
		overlayOptions: createPanelOverlayOptions(56, "70%") as never,
	});
}
