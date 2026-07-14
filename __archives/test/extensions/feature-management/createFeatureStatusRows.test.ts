import assert from "node:assert/strict";
import test from "node:test";
import { createFeatureStatusRows } from "../../../packages/extensions-dev/src/feature-management/model/createFeatureStatusRows.js";
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
		other: {
			"social-chat": {
				category: "mini-app",
				devOnly: true,
				enabled: true,
				features: ["social chat CLI commands"],
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
		other: {
			"social-chat": {
				category: "mini-app",
				devOnly: true,
				enabled: false,
				features: ["social chat CLI commands"],
			},
		},
	};

	assert.deepEqual(createFeatureStatusRows(config, runtimeConfig), [
		{
			category: "core",
			sourceCategory: "extensions",
			extensionId: "alpha",
			feature: "alpha",
			status: "enabled",
			channel: "production",
			group: "Production",
		},
		{
			category: "core",
			sourceCategory: "extensions",
			extensionId: "beta",
			feature: "beta",
			status: "enabled",
			channel: "dev",
			group: "Playground",
		},
		{
			category: "core",
			sourceCategory: "extensions",
			extensionId: "gamma",
			feature: "gamma",
			status: "disabled",
			channel: "production",
			group: "Production",
		},
		{
			category: "mini-apps",
			sourceCategory: "other",
			extensionId: "social-chat",
			feature: "social-chat",
			status: "disabled",
			channel: "dev",
			group: "Playground",
		},
	]);
});
