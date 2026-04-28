import type { AuthImportSource } from "../model/AuthImportSource.js";
import type { AuthImportCandidate } from "../model/AuthImportCandidate.js";
import type { LoginImportInteractiveMode } from "../model/LoginImportInteractiveMode.js";
import { AuthImportProviderSelect } from "../ui/AuthImportProviderSelect.js";
import { loadAuthImportCandidates } from "../collect/loadAuthImportCandidates.js";
import { importAuthCandidates } from "../import/importAuthCandidates.js";
import { getAuthImportSourceLabel } from "../model/getAuthImportSourceLabel.js";
import { refreshLoginImportState } from "./refreshLoginImportState.js";

type SelectCapableMode = LoginImportInteractiveMode & {
	showSelector(create: (done: () => void) => { component: unknown; focus: unknown }): void;
};

/**
 * Runs the in-modal provider import flow for a selected auth source.
 *
 * @param mode Active interactive mode instance.
 * @param source Import source identifier.
 */
export async function runAuthImportFlow(mode: SelectCapableMode, source: AuthImportSource): Promise<void> {
	const sourceLabel = getAuthImportSourceLabel(source);
	try {
		const { authPath, candidates } = await loadAuthImportCandidates(source, mode.session.modelRegistry);
		if (candidates.length === 0) {
			mode.showStatus(`No importable ${sourceLabel} providers found at ${authPath}.`);
			return;
		}
		const selectedCandidates = await selectAuthImportCandidates(mode, candidates);
		if (!selectedCandidates) {
			mode.showStatus("Import cancelled");
			return;
		}
		if (selectedCandidates.length === 0) {
			mode.showStatus("No providers selected for import");
			return;
		}
		const importedProviderIds = importAuthCandidates(mode.session.modelRegistry.authStorage, selectedCandidates);
		await refreshLoginImportState(mode);
		mode.showStatus(`Imported ${importedProviderIds.join(", ")} from ${sourceLabel}`);
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		mode.showError(`Import from ${sourceLabel} failed: ${message}`);
	}
}

/**
 * Opens the in-modal provider multi-select.
 *
 * @param mode Active interactive mode instance.
 * @param candidates Importable provider candidates.
 * @returns Selected candidates, or undefined when cancelled.
 */
function selectAuthImportCandidates(
	mode: SelectCapableMode,
	candidates: readonly AuthImportCandidate[],
): Promise<AuthImportCandidate[] | undefined> {
	return new Promise((resolve) => {
		mode.showSelector((done: () => void) => {
			const selector = new AuthImportProviderSelect(
				candidates,
				(selectedCandidates) => {
					done();
					resolve(selectedCandidates);
				},
				() => {
					done();
					resolve(undefined);
				},
			);
			return { component: selector, focus: selector };
		});
	});
}
