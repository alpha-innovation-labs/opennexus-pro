import assert from "node:assert/strict";
import test from "node:test";
import type { Component } from "@earendil-works/pi-tui";
import { showPiPackagesModal } from "../../../packages/extension-core/src/pi-packages/command/showPiPackagesModal.js";
import { createTestTheme } from "../../support/theme/createTestTheme.js";

test("pi-packages modal ignores stale user extension rows without configured packages", async () => {
	const originalHome = process.env.HOME;
	const home = await import("node:fs/promises").then(({ mkdtemp }) => mkdtemp(`${process.cwd()}/.tmp-pi-packages-`));
	let renderedComponent: Component | null = null;
	const ctx = {
		cwd: process.cwd(),
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
		await import("node:fs/promises").then(({ mkdir, writeFile }) => mkdir(`${home}/.config/nexus`, { recursive: true }).then(() => writeFile(`${home}/.config/nexus/config.json`, JSON.stringify({ extensions: { "third-party-beta": { enabled: true } } }), "utf8")));
		await showPiPackagesModal(ctx as never);
		(renderedComponent as { handleInput(data: string): void } | null)?.handleInput("\r");
		const savedConfig = await import("node:fs/promises").then(({ readFile }) => readFile(`${home}/.config/nexus/config.json`, "utf8"));

		assert.match(savedConfig, /"extensions"/u);
		assert.match(savedConfig, /"third-party-beta"/u);
		assert.match(savedConfig, /"enabled":true/u);
	} finally {
		await import("node:fs/promises").then(({ rm }) => rm(home, { recursive: true, force: true }));
		if (originalHome) process.env.HOME = originalHome;
		else delete process.env.HOME;
	}
});
