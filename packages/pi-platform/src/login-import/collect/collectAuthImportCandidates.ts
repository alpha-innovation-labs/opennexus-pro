import type { AuthImportCandidate } from "../model/AuthImportCandidate.js";
import type { AuthImportSource } from "../model/AuthImportSource.js";
import type { LoginImportModelRegistry } from "../model/LoginImportRegistry.js";
import { createProviderDisplayNameResolver } from "../model/createProviderDisplayNameResolver.js";
import { getOpenCodeProviderAlias } from "../model/getOpenCodeProviderAlias.js";
import { getRegisteredProviderIds } from "../model/getRegisteredProviderIds.js";
import { normalizeImportCredential } from "../normalize/normalizeImportCredential.js";
import { isRecord } from "../guards/isRecord.js";

/**
 * Builds importable credential candidates that are known and not already configured.
 *
 * @param source Import source identifier.
 * @param data Parsed auth.json data.
 * @param modelRegistry Active Nexus model registry.
 * @returns Import candidates sorted by display name.
 */
export function collectAuthImportCandidates(
	source: AuthImportSource,
	data: unknown,
	modelRegistry: LoginImportModelRegistry,
): AuthImportCandidate[] {
	if (!isRecord(data)) {
		return [];
	}
	const displayNameFor = createProviderDisplayNameResolver(modelRegistry);
	const registeredProviderIds = getRegisteredProviderIds(modelRegistry);
	const seenProviderIds = new Set<string>();
	const candidates: AuthImportCandidate[] = [];
	for (const [sourceProviderId, rawCredential] of Object.entries(data)) {
		const credential = normalizeImportCredential(source, rawCredential);
		if (!credential) {
			continue;
		}
		const providerId =
			source === "opencode" ? getOpenCodeProviderAlias(sourceProviderId, credential.type) : sourceProviderId;
		if (seenProviderIds.has(providerId) || !registeredProviderIds.has(providerId)) {
			continue;
		}
		if (modelRegistry.authStorage.hasAuth(providerId)) {
			continue;
		}
		seenProviderIds.add(providerId);
		candidates.push({
			providerId,
			displayName: displayNameFor(providerId),
			credential,
			sourceProviderId,
		});
	}
	return candidates.sort((a, b) => a.displayName.localeCompare(b.displayName));
}
