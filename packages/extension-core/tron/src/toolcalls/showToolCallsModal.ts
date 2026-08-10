import type { ExtensionCommandContext } from "@earendil-works/pi-coding-agent";
import { createPanelOverlayOptions } from "@nexus/tui-kit/modal/createPanelOverlayOptions";
import { ToolCallsModal } from "./ToolCallsModal";
import { getBranchToolCalls } from "./getBranchToolCalls";

/**
 * Opens the tool-calls browser for the current branch.
 *
 * @param ctx Pi command context.
 */
export async function showToolCallsModal(ctx: ExtensionCommandContext): Promise<void> {
	if (!ctx.hasUI) return;
	const result = getBranchToolCalls(ctx);
	if (!result) {
		ctx.ui.notify("Current branch has no tool calls", "warning");
		return;
	}
	await ctx.ui.custom<void>(
		(_tui, theme, _keybindings, done) => new ToolCallsModal(theme, result.groups, result.toolCalls, done),
		{
			overlay: true,
			overlayOptions: createPanelOverlayOptions(80, "85%"),
		},
	);
}
