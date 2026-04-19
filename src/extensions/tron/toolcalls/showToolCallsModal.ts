import type { ExtensionCommandContext } from "@mariozechner/pi-coding-agent";
import { ToolCallsModal } from "./ToolCallsModal.js";
import { getBranchToolCalls } from "./getBranchToolCalls.js";

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
			overlayOptions: {
				anchor: "center",
				width: "80%",
				minWidth: 80,
				maxHeight: "85%",
			},
		},
	);
}
