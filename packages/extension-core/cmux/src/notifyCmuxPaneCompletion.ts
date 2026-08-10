import { notifyCurrentCmuxSurface } from "./runtime/notifyCurrentCmuxSurface";
import { getCmuxTitleSyncEnabled } from "./state/getCmuxTitleSyncEnabled";

/**
 * Emits a completion notification for the active cmux pane.
 *
 * @param sessionTitle Current Nexus session title.
 */
export async function notifyCmuxPaneCompletion(sessionTitle: string): Promise<void> {
	if (!getCmuxTitleSyncEnabled()) return;
	await notifyCurrentCmuxSurface(sessionTitle);
}
