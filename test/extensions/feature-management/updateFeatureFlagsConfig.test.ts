import assert from "node:assert/strict";
import test from "node:test";
import { updateFeatureFlagsConfig } from "../../../packages/extensions/src/feature-management/model/updateFeatureFlagsConfig.js";
import type { FeatureFlagsConfig } from "../../../packages/feature-flags/src/types.js";

test("feature flag config updates preserve feature lists while toggling status and channel", () => {
	const config: FeatureFlagsConfig = {
		extensions: {
			alpha: {
				enabled: true,
				features: ["alpha command"],
			},
		},
	};

	const disabled = updateFeatureFlagsConfig(config, "alpha", { status: "disabled" });
	const playground = updateFeatureFlagsConfig(disabled, "alpha", { channel: "dev" });
	const production = updateFeatureFlagsConfig(playground, "alpha", { channel: "production" });

	assert.equal(playground.extensions.alpha?.enabled, false);
	assert.equal(playground.extensions.alpha?.devOnly, true);
	assert.deepEqual(production, {
		extensions: {
			alpha: {
				enabled: false,
				features: ["alpha command"],
			},
		},
	});
	assert.equal(config.extensions.alpha?.enabled, true);
});
