export type EnabledModelSettings = {
	getEnabledModels: () => string[] | undefined;
	setEnabledModels: (patterns: string[] | undefined) => void;
};

/**
 * Removes provider-qualified model patterns for a logged-out provider.
 *
 * @param settings Settings manager with enabled-model accessors.
 * @param providerId Provider id that was logged out.
 * @returns The persisted enabled models after cleanup.
 */
export function removeProviderFromEnabledModels(
	settings: EnabledModelSettings,
	providerId: string,
): string[] | undefined {
	const enabledModels = settings.getEnabledModels();
	if (!enabledModels) return undefined;
	const nextEnabledModels = enabledModels.filter(
		(pattern) => !isProviderModelPattern(pattern, providerId),
	);
	if (nextEnabledModels.length === enabledModels.length) return enabledModels;
	const persistedModels =
		nextEnabledModels.length > 0 ? nextEnabledModels : undefined;
	settings.setEnabledModels(persistedModels);
	return persistedModels;
}

/**
 * Checks whether a model pattern is explicitly scoped to a provider.
 *
 * @param pattern Model pattern, optionally including a thinking suffix.
 * @param providerId Provider id to match.
 * @returns True when the pattern starts with the provider namespace.
 */
function isProviderModelPattern(pattern: string, providerId: string): boolean {
	return pattern.trim().startsWith(`${providerId}/`);
}
