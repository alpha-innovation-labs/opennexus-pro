import type { ExtensionCommandContext, ExtensionContext } from "@earendil-works/pi-coding-agent";
import { getCurrentConversationId } from "../shared/getCurrentConversationId";
import { getObservationStatePath } from "../shared/getObservationStatePath";
import type { ObservationsModal } from "./ObservationsModal";
import { readObservationSections } from "./readObservationSections";
import { recreateCurrentObservation } from "./recreateCurrentObservation";

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
