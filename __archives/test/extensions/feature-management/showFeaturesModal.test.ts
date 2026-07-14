import assert from "node:assert/strict";
import test from "node:test";
import type { Component } from "@earendil-works/pi-tui";
import { showFeaturesModal } from "../../../packages/extensions-dev/src/feature-management/command/showFeaturesModal.js";
import type { FeatureFlagsConfig } from "../../../packages/feature-flags/src/types.js";
import { createTestTheme } from "../../support/theme/createTestTheme.js";

test("features modal persists config whenever a menu value changes", async () => {
	const config: FeatureFlagsConfig = {
		extensions: {
			alpha: {
				enabled: true,
				features: ["alpha command"],
			},
		},
	};
	const savedConfigs: FeatureFlagsConfig[] = [];
	let renderedComponent: Component | null = null;
	const ctx = {
		hasUI: true,
		ui: {
			custom(factory: (tui: unknown, theme: unknown, keybindings: unknown, done: () => void) => Component) {
				renderedComponent = factory(null, createTestTheme(), null, () => undefined);
				return Promise.resolve(undefined);
			},
			notify() {},
		},
	};

	await showFeaturesModal(ctx as never, () => config, (nextConfig) => savedConfigs.push(nextConfig));
	(renderedComponent as { handleInput(data: string): void } | null)?.handleInput("\r");

	assert.deepEqual(savedConfigs, [
		{
			extensions: {
				alpha: {
					enabled: false,
					features: ["alpha command"],
				},
			},
		},
	]);
});

test("features modal persists mini-app edits to their source bucket", async () => {
	const config: FeatureFlagsConfig = {
		extensions: {},
		other: {
			"social-chat": {
				category: "mini-app",
				enabled: false,
				features: ["social chat CLI commands"],
			},
		},
	};
	const savedConfigs: FeatureFlagsConfig[] = [];
	let renderedComponent: Component | null = null;
	const ctx = {
		hasUI: true,
		ui: {
			custom(factory: (tui: unknown, theme: unknown, keybindings: unknown, done: () => void) => Component) {
				renderedComponent = factory(null, createTestTheme(), null, () => undefined);
				return Promise.resolve(undefined);
			},
			notify() {},
		},
	};

	await showFeaturesModal(ctx as never, () => config, (nextConfig) => savedConfigs.push(nextConfig));
	(renderedComponent as { handleInput(data: string): void } | null)?.handleInput("\t");
	(renderedComponent as { handleInput(data: string): void } | null)?.handleInput("\t");
	(renderedComponent as { handleInput(data: string): void } | null)?.handleInput("\t");
	(renderedComponent as { handleInput(data: string): void } | null)?.handleInput("\r");

	assert.equal(savedConfigs[0]?.other?.["social-chat"]?.enabled, true);
	assert.equal(savedConfigs[0]?.other?.["social-chat"]?.category, "mini-app");
});
