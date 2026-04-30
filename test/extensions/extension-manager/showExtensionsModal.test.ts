import assert from "node:assert/strict";
import test from "node:test";
import type { Component } from "@mariozechner/pi-tui";
import { showExtensionsModal } from "../../../packages/extensions/src/extension-manager/command/showExtensionsModal.js";
import { createTestTheme } from "../../support/theme/createTestTheme.js";

test("extensions modal persists user enablement when a row toggles", async () => {
	const originalHome = process.env.HOME;
	const home = await import("node:fs/promises").then(({ mkdtemp }) => mkdtemp(`${process.cwd()}/.tmp-extension-manager-`));
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

	try {
		process.env.HOME = home;
		await showExtensionsModal(ctx as never);
		(renderedComponent as { handleInput(data: string): void } | null)?.handleInput("\r");
		const savedConfig = await import("node:fs/promises").then(({ readFile }) => readFile(`${home}/.config/nexus/config.json`, "utf8"));

		assert.match(savedConfig, /"extensions"/u);
		assert.match(savedConfig, /"enabled": false/u);
	} finally {
		await import("node:fs/promises").then(({ rm }) => rm(home, { recursive: true, force: true }));
		if (originalHome) process.env.HOME = originalHome;
		else delete process.env.HOME;
	}
});
