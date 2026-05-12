import { isRuntimeFeatureAvailable } from "@nexus/feature-flags/isRuntimeFeatureAvailable.js";
import { readCliFeatureFlagsConfig } from "./readCliFeatureFlagsConfig.js";

/**
 * Reports whether a CLI feature is available to the current runtime.
 *
 * Source dev runs honor enabled dev-only flags. Compiled release runs only expose
 * production-safe flags left in the compiled manifest.
 *
 * @param featureId Feature id in feature-flags.json.
 * @returns True when the feature should be exposed by the CLI.
 */
export function isCliFeatureAvailable(featureId: string): boolean {
	const { config, source } = readCliFeatureFlagsConfig();
	const feature = config.other?.[featureId] ?? config.extensions[featureId];
	if (source === "source") return feature?.enabled === true;
	return isRuntimeFeatureAvailable(feature);
}
