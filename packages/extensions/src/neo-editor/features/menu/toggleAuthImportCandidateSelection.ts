/**
 * Toggles one provider id inside the auth import selection set.
 *
 * @param selectedProviderIds Mutable selected provider-id set.
 * @param providerId Provider id to toggle.
 */
export function toggleAuthImportCandidateSelection(selectedProviderIds: Set<string>, providerId: string): void {
	if (selectedProviderIds.has(providerId)) {
		selectedProviderIds.delete(providerId);
		return;
	}
	selectedProviderIds.add(providerId);
}
