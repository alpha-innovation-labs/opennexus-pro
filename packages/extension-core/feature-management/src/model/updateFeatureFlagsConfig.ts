import type { FeatureRuntimeStatus } from "./types";

export type FeatureFlagConfigPatch = {
	status?: FeatureRuntimeStatus;
};
