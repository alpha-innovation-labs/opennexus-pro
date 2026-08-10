import type { ExtensionCommandContext, ExtensionContext } from "@earendil-works/pi-coding-agent";
import { getCurrentConversationId } from "../shared/getCurrentConversationId.js";
import { getObservationStatePath } from "../shared/getObservationStatePath.js";
import type { ObservationsModal } from "./ObservationsModal.js";
import { readObservationSections } from "./readObservationSections.js";
import { recreateCurrentObservation } from "./recreateCurrentObservation.js";

/**
 * Recreates the active observation and refreshes the open observations modal.
 *
 * @param ctx Pi extension context.
 * @param modal Open observations modal instance.
 */
export async function recreateAndRefreshObservationsModal(ctx: ExtensionContext | ExtensionCommandContext, modal: ObservationsModal): Promise<void> {
	if (!await recreateCurrentObservation(ctx)) return;
	const conversationId = getCurrentConversationId(ctx);
	if (!conversationId) return;
	const statePath = getObservationStatePath(conversationId);
	const sections = await readObservationSections(statePath, conversationId, ctx.cwd, ctx.sessionManager.getSessionFile() ?? null);
	modal.setObservationSections(sections.items, sections.detailsByValue);
}
