import type { ExtensionCommandContext } from "@mariozechner/pi-coding-agent";
import type { AuthImportSource } from "../model/AuthImportSource.js";
import type { AuthImportCandidate } from "../model/AuthImportCandidate.js";
import { AuthImportProviderSelect } from "../ui/AuthImportProviderSelect.js";
import { loadAuthImportCandidates } from "../collect/loadAuthImportCandidates.js";
import { importAuthCandidates } from "../import/importAuthCandidates.js";
import { getAuthImportSourceLabel } from "../model/getAuthImportSourceLabel.js";

/**
 * Runs auth import from extension UI inside the Nexus modal.
 *
 * @param ctx Active extension command context.
 * @param source Import source identifier.
 */
export async function runExtensionAuthImportFlow(
	ctx: ExtensionCommandContext,
	source: AuthImportSource,
): Promise<void> {
	const sourceLabel = getAuthImportSourceLabel(source);
	try {
		const { authPath, candidates } = await loadAuthImportCandidates(source, ctx.modelRegistry);
		if (candidates.length === 0) {
			ctx.ui.notify(`No importable ${sourceLabel} providers found at ${authPath}.`, "info");
			return;
		}
		const selectedCandidates = await selectExtensionAuthImportCandidates(ctx, candidates);
		if (!selectedCandidates) {
			ctx.ui.notify("Import cancelled", "info");
			return;
		}
		if (selectedCandidates.length === 0) {
			ctx.ui.notify("No providers selected for import", "info");
			return;
		}
		const importedProviderIds = importAuthCandidates(ctx.modelRegistry.authStorage, selectedCandidates);
		ctx.modelRegistry.refresh();
		await ctx.reload();
		ctx.ui.notify(`Imported ${importedProviderIds.join(", ")} from ${sourceLabel}`, "info");
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		ctx.ui.notify(`Import from ${sourceLabel} failed: ${message}`, "error");
	}
}

/**
 * Opens extension UI's in-modal provider multi-select.
 *
 * @param ctx Active extension command context.
 * @param candidates Importable provider candidates.
 * @returns Selected candidates, or undefined when cancelled.
 */
function selectExtensionAuthImportCandidates(
	ctx: ExtensionCommandContext,
	candidates: readonly AuthImportCandidate[],
): Promise<AuthImportCandidate[] | undefined> {
	return ctx.ui.custom<AuthImportCandidate[] | undefined>((_tui, _theme, _keybindings, done) => {
		return new AuthImportProviderSelect(candidates, done, () => done(undefined));
	});
}
