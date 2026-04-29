import type { FeatureFlagsConfig } from "@nexus/feature-flags/types.js";

export type CliFeatureFlagsConfigSource = "source" | "compiled";

export type CliFeatureFlagsConfigResult = {
	config: FeatureFlagsConfig;
	source: CliFeatureFlagsConfigSource;
};
