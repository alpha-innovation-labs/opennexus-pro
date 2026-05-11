import assert from "node:assert/strict";
import test from "node:test";
import { registerFeatureManagementExtensionWithConfig } from "../../../packages/extensions-dev/src/feature-management/registerFeatureManagementExtensionWithConfig.js";
import type { FeatureFlagsConfig } from "../../../packages/feature-flags/src/types.js";

test("feature management extension registers the /features command", () => {
	const config: FeatureFlagsConfig = {
		extensions: {
			"feature-management": {
				enabled: true,
				features: ["/features command"],
			},
		},
	};
	const commands = new Map<string, { description?: string; handler: unknown }>();
	const pi = {
		registerCommand(name: string, definition: { description?: string; handler: unknown }) {
			commands.set(name, definition);
		},
	};

	registerFeatureManagementExtensionWithConfig(pi as never, () => config);

	assert.equal(commands.get("features")?.description, "Show feature flags and release channels");
	assert.equal(typeof commands.get("features")?.handler, "function");
});
