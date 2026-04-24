import type { ExtensionCommandContext, ExtensionContext } from "@mariozechner/pi-coding-agent";
import { getCurrentConversationId } from "../shared/getCurrentConversationId.js";
import { getObservationStatePath } from "../shared/getObservationStatePath.js";
import { ObservationsModal } from "./ObservationsModal.js";
import { readObservationSections } from "./readObservationSections.js";

/**
 * Opens the observations browser modal for the current conversation.
 *
 * @param ctx Pi extension context.
 */
export async function showObservationsModal(ctx: ExtensionContext | ExtensionCommandContext): Promise<void> {
	if (!ctx.hasUI) return;
	const conversationId = getCurrentConversationId(ctx);
	if (!conversationId) {
		ctx.ui.notify("No current conversation found", "warning");
		return;
	}
	const statePath = getObservationStatePath(conversationId);
	const { items, detailsByValue } = await readObservationSections(statePath, conversationId, ctx.cwd, ctx.sessionManager.getSessionFile() ?? null);
	await ctx.ui.custom<undefined>(
		(_tui, theme, _keybindings, done) => new ObservationsModal(theme, items, detailsByValue, done),
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
