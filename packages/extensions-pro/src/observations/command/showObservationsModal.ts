import type { ExtensionCommandContext, ExtensionContext } from "@earendil-works/pi-coding-agent";
import { createPanelOverlayOptions } from "@nexus/tui-kit/modal/createPanelOverlayOptions.js";
import { getCurrentConversationId } from "../shared/getCurrentConversationId.js";
import { getObservationStatePath } from "../shared/getObservationStatePath.js";
import { editObservationPrompt } from "./editObservationPrompt.js";
import { isObservationPromptEditingEnabled } from "./isObservationPromptEditingEnabled.js";
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
	const promptEditingEnabled = isObservationPromptEditingEnabled();
	await ctx.ui.custom<undefined>(
		(tui, theme, _keybindings, done) => new ObservationsModal(theme, items, detailsByValue, done, () => {
			if (promptEditingEnabled) void editObservationPrompt(ctx, tui);
		}, promptEditingEnabled),
		{
			overlay: true,
			overlayOptions: createPanelOverlayOptions(80, "85%"),
		},
	);
}
