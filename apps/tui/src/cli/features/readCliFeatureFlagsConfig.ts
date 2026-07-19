import { getBundledFeatureFlagsConfig } from "@nexus/feature-flags/getBundledFeatureFlagsConfig.js";
import { readFeatureFlagsConfig } from "@nexus/feature-flags/readFeatureFlagsConfig.js";
import type { CliFeatureFlagsConfigResult } from "./types.js";

/**
 * Reads feature flags for CLI gating, falling back to compiled flags in packaged runtimes.
 *
 * @returns Active feature-flag config and its source.
 */
export function readCliFeatureFlagsConfig(): CliFeatureFlagsConfigResult {
	try {
		return { config: readFeatureFlagsConfig(), source: "source" };
	} catch {
		return { config: getBundledFeatureFlagsConfig(), source: "compiled" };
	}
}
