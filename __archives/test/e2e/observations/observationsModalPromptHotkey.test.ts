import assert from "node:assert/strict";
import type { AutocompleteItem } from "@earendil-works/pi-tui";
import test from "node:test";
import { ObservationsModal } from "../../../packages/extensions-pro/src/observations/command/ObservationsModal.js";
import { renderComponentInVirtualTerminal } from "../../support/render/renderComponentInVirtualTerminal.js";
import { createTestTheme } from "../../support/theme/createTestTheme.js";

const items: AutocompleteItem[] = [{ value: "topic-1", label: "Topic one" }];
const details = new Map([["topic-1", ["Observation detail"]]]);

test("/observations modal shows recreate and edit prompt hotkeys in dev", async () => {
	const viewport = await renderComponentInVirtualTerminal(
		() => new ObservationsModal(createTestTheme(), items, details, () => {}, () => {}, true),
		120,
		30,
	);

	assert.match(viewport.join("\n"), /r recreate/u);
	assert.match(viewport.join("\n"), /e edit prompt/u);
});

test("/observations modal runs recreate hotkey", () => {
	let recreateCount = 0;
	const modal = new ObservationsModal(createTestTheme(), items, details, () => {}, () => {}, true, () => {
		recreateCount += 1;
	});

	modal.handleInput("r");

	assert.equal(recreateCount, 1);
});

test("/observations modal runs edit prompt hotkey", () => {
	let editCount = 0;
	const modal = new ObservationsModal(createTestTheme(), items, details, () => {}, () => {
		editCount += 1;
	}, true);

	modal.handleInput("e");

	assert.equal(editCount, 1);
});

test("/observations modal hides edit prompt hotkey in release", async () => {
	let editCount = 0;
	const viewport = await renderComponentInVirtualTerminal(
		() => new ObservationsModal(createTestTheme(), items, details, () => {}, () => {
			editCount += 1;
		}, false),
		120,
		30,
	);
	const modal = new ObservationsModal(createTestTheme(), items, details, () => {}, () => {
		editCount += 1;
	}, false);

	modal.handleInput("e");

	assert.match(viewport.join("\n"), /r recreate/u);
	assert.doesNotMatch(viewport.join("\n"), /e edit prompt/u);
	assert.equal(editCount, 0);
});
