import type {
	ExtensionCommandContext,
	ExtensionContext,
} from "@earendil-works/pi-coding-agent";
import { createPanelOverlayOptions } from "@nexus/tui-kit/modal/createPanelOverlayOptions";
import { getCurrentConversationId } from "../shared/getCurrentConversationId";
import { getObservationStatePath } from "../shared/getObservationStatePath";
import { editObservationPrompt } from "./editObservationPrompt";
import { isObservationPromptEditingEnabled } from "./isObservationPromptEditingEnabled";
import { ObservationsModal } from "./ObservationsModal";
import { readObservationSections } from "./readObservationSections";
import { recreateAndRefreshObservationsModal } from "./recreateAndRefreshObservationsModal";

/**
 * Opens the observations browser modal for the current conversation.
 *
 * @param ctx Pi extension context.
 */
export async function showObservationsModal(
	ctx: ExtensionContext | ExtensionCommandContext,
): Promise<void> {
	if (!ctx.hasUI) return;
	const conversationId = getCurrentConversationId(ctx);
	if (!conversationId) {
		ctx.ui.notify("No current conversation found", "warning");
		return;
	}
	const statePath = getObservationStatePath(conversationId);
	const { items, detailsByValue } = await readObservationSections(
		statePath,
		conversationId,
		ctx.cwd,
		ctx.sessionManager.getSessionFile() ?? null,
	);
	const promptEditingEnabled = isObservationPromptEditingEnabled();
	await ctx.ui.custom<undefined>(
		(tui, theme, _keybindings, done) => {
			let modal: ObservationsModal | undefined;
			modal = new ObservationsModal(
				theme,
				items,
				detailsByValue,
				done,
				() => {
					if (promptEditingEnabled) void editObservationPrompt(ctx, tui);
				},
				promptEditingEnabled,
				() => {
					if (modal) void recreateAndRefreshObservationsModal(ctx, modal);
				},
			);
			return modal;
		},
		{
			overlay: true,
			overlayOptions: createPanelOverlayOptions(80, "85%"),
		},
	);
}
