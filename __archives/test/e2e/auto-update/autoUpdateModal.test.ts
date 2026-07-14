import assert from "node:assert/strict";
import test from "node:test";
import { AutoUpdateModal } from "../../../packages/extension-core/src/auto-update/ui/AutoUpdateModal.js";
import { renderComponentInVirtualTerminal } from "../../support/render/renderComponentInVirtualTerminal.js";
import { createTestTheme } from "../../support/theme/createTestTheme.js";

test("auto-update modal renders a startup yes/no update prompt", async () => {
	const viewport = await renderComponentInVirtualTerminal(
		() => new AutoUpdateModal({
			currentVersion: "0.2.20",
			latestVersion: "0.2.21",
			onCancel: () => {},
			onConfirm: () => {},
			packageName: "opennexus",
			theme: createTestTheme(),
		}),
		100,
		24,
	);
	const output = viewport.join("\n");

	assert.match(output, /Nexus update available/u);
	assert.match(output, /Current: 0\.2\.20/u);
	assert.match(output, /Latest: 0\.2\.21/u);
	assert.doesNotMatch(output, /A newer Nexus release is available on npm/u);
	assert.doesNotMatch(output, /Package: opennexus/u);
	assert.doesNotMatch(output, /Yes: install update/u);
	assert.doesNotMatch(output, /No: skip/u);
	assert.match(output, /Enter\/y: yes · Esc\/n: no/u);
});

test("auto-update modal maps enter to yes and escape to no", () => {
	const actions: string[] = [];
	const modal = new AutoUpdateModal({
		currentVersion: "0.2.20",
		latestVersion: "0.2.21",
		onCancel: () => actions.push("no"),
		onConfirm: () => actions.push("yes"),
		packageName: "opennexus",
		theme: createTestTheme(),
	});

	modal.handleInput("\r");
	modal.handleInput("\x1b");

	assert.deepEqual(actions, ["yes", "no"]);
});
