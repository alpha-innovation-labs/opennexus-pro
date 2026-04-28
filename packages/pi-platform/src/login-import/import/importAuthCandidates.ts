import type { AuthStorage } from "@mariozechner/pi-coding-agent";
import type { AuthImportCandidate } from "../model/AuthImportCandidate.js";

/**
 * Persists selected import candidates into Nexus auth storage.
 *
 * @param authStorage Active Nexus auth storage.
 * @param candidates Selected import candidates.
 * @returns Imported provider ids.
 */
export function importAuthCandidates(authStorage: AuthStorage, candidates: readonly AuthImportCandidate[]): string[] {
	for (const candidate of candidates) {
		authStorage.set(candidate.providerId, candidate.credential);
	}
	return candidates.map((candidate) => candidate.providerId);
}
