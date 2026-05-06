import type { FeatureFlagsConfig } from "@nexus/feature-flags/types.js";

/**
 * Sets one mini-app enabled state in its owning feature-flag bucket.
 *
 * @param config Current feature flag config.
 * @param miniAppId Mini-app feature id.
 * @param enabled Desired enabled state.
 * @returns Updated feature flag config.
 */
export function setMiniAppEnabled(config: FeatureFlagsConfig, miniAppId: string, enabled: boolean): FeatureFlagsConfig {
	if (config.extensions[miniAppId]?.category === "mini-app") {
		return {
			...config,
			extensions: {
				...config.extensions,
				[miniAppId]: { ...config.extensions[miniAppId], enabled },
			},
		};
	}
	if (config.other?.[miniAppId]?.category === "mini-app") {
		return {
			...config,
			other: {
				...config.other,
				[miniAppId]: { ...config.other[miniAppId], enabled },
			},
		};
	}
	return config;
}
