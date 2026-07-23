import type { FeatureRuntimeStatus } from "./types.js";

export type FeatureFlagConfigPatch = {
	status?: FeatureRuntimeStatus;
};
