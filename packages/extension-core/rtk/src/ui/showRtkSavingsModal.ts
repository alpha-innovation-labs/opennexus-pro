import type { ExtensionContext } from "@earendil-works/pi-coding-agent";
import { createPanelOverlayOptions } from "@nexus/tui-kit";
import type { RtkGainReport } from "../savings/RtkGainReport";
import type { SavingsReport } from "../savings/SavingsReport";
import { RtkSavingsModal } from "./RtkSavingsModal";

/**
 * Opens the RTK savings modal as a child overlay.
 *
 * @param ctx Extension context.
 * @param report Parsed RTK gain report.
 */
export async function showRtkSavingsModal(
	ctx: ExtensionContext,
	report: RtkGainReport | SavingsReport,
): Promise<void> {
	await ctx.ui.custom<void>(
		(tui, theme, _keybindings, done) =>
			new RtkSavingsModal(theme, report, done, () => tui.requestRender()),
		{
			overlay: true,
			overlayOptions: createPanelOverlayOptions(56, "70%"),
		},
	);
}
