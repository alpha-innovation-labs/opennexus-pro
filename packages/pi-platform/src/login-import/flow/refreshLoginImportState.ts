import type { LoginImportInteractiveMode } from "../model/LoginImportInteractiveMode.js";

/**
 * Refreshes Nexus model and footer state after auth imports.
 *
 * @param mode Active interactive mode instance.
 */
export async function refreshLoginImportState(mode: LoginImportInteractiveMode): Promise<void> {
	mode.session.modelRegistry.refresh();
	await mode.updateAvailableProviderCount();
	mode.footer?.invalidate();
	mode.updateEditorBorderColor();
}
