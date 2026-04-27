import assert from "node:assert/strict";
import test from "node:test";
import { createFeatureStatusRows } from "../../../packages/extensions/src/feature-management/model/createFeatureStatusRows.js";
import type { FeatureFlagsConfig } from "../../../packages/feature-flags/src/types.js";

test("feature status rows expose enabled state, channel, and group per extension", () => {
	const config: FeatureFlagsConfig = {
		extensions: {
			alpha: {
				enabled: true,
				features: ["alpha command", "alpha modal"],
			},
			beta: {
				devOnly: true,
				enabled: true,
				features: ["beta playground"],
			},
			gamma: {
				enabled: false,
				features: ["gamma tool"],
			},
		},
	};
	const runtimeConfig: FeatureFlagsConfig = {
		extensions: {
			alpha: {
				enabled: true,
				features: ["alpha command", "alpha modal"],
			},
			beta: {
				devOnly: true,
				enabled: true,
				features: ["beta playground"],
			},
			gamma: {
				enabled: false,
				features: ["gamma tool"],
			},
		},
	};

	assert.deepEqual(createFeatureStatusRows(config, runtimeConfig), [
		{
			extensionId: "alpha",
			feature: "alpha",
			status: "enabled",
			channel: "production",
			group: "Production",
		},
		{
			extensionId: "beta",
			feature: "beta",
			status: "enabled",
			channel: "dev",
			group: "Playground",
		},
		{
			extensionId: "gamma",
			feature: "gamma",
			status: "disabled",
			channel: "production",
			group: "Production",
		},
	]);
});
