import assert from "node:assert/strict";
import test from "node:test";
import { createFeatureStatusRows } from "../../../src/extensions/feature-management/model/createFeatureStatusRows.js";
import type { FeatureFlagsConfig } from "../../../src/feature-flags/types.js";

test("feature status rows expose enabled state and production/dev channel per feature", () => {
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
			feature: "alpha command",
			status: "enabled",
			channel: "production",
		},
		{
			extensionId: "alpha",
			feature: "alpha modal",
			status: "enabled",
			channel: "production",
		},
		{
			extensionId: "beta",
			feature: "beta playground",
			status: "enabled",
			channel: "dev",
		},
		{
			extensionId: "gamma",
			feature: "gamma tool",
			status: "disabled",
			channel: "production",
		},
	]);
});
