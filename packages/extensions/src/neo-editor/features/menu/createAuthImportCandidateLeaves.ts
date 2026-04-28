import type { AuthImportCandidate } from "@nexus/pi-platform/login-import/model/AuthImportCandidate.js";
import type { SlashMenuLeaf } from "./types.js";

/**
 * Builds slash-menu leaves for importable auth provider candidates.
 *
 * @param candidates Importable auth provider candidates.
 * @param selectedProviderIds Currently selected provider ids.
 * @returns Candidate leaves for the import provider selection level.
 */
export function createAuthImportCandidateLeaves(
	candidates: readonly AuthImportCandidate[],
	selectedProviderIds: ReadonlySet<string>,
): SlashMenuLeaf[] {
	return candidates.map((candidate) => ({
		kind: "provider",
		label: candidate.displayName,
		description: formatAuthImportCandidateDescription(candidate),
		value: candidate.providerId,
		groupLabel: "Providers",
		currentValue: selectedProviderIds.has(candidate.providerId) ? "selected" : undefined,
	}));
}

/**
 * Formats import candidate source details for the right preview/search metadata.
 *
 * @param candidate Importable auth provider candidate.
 * @returns Candidate source mapping description.
 */
function formatAuthImportCandidateDescription(candidate: AuthImportCandidate): string {
	return candidate.sourceProviderId === candidate.providerId
		? candidate.providerId
		: `${candidate.sourceProviderId} → ${candidate.providerId}`;
}
