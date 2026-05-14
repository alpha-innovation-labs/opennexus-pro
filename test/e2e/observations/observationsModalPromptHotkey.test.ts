import assert from "node:assert/strict";
import type { AutocompleteItem } from "@earendil-works/pi-tui";
import test from "node:test";
import { ObservationsModal } from "../../../packages/extensions-pro/src/observations/command/ObservationsModal.js";
import { renderComponentInVirtualTerminal } from "../../support/render/renderComponentInVirtualTerminal.js";
import { createTestTheme } from "../../support/theme/createTestTheme.js";

const items: AutocompleteItem[] = [{ value: "topic-1", label: "Topic one" }];
const details = new Map([["topic-1", ["Observation detail"]]]);

test("/observations modal shows edit prompt hotkey", async () => {
	const viewport = await renderComponentInVirtualTerminal(
		() => new ObservationsModal(createTestTheme(), items, details, () => {}, () => {}),
		120,
		30,
	);

	assert.match(viewport.join("\n"), /e edit prompt/u);
});

test("/observations modal runs edit prompt hotkey", () => {
	let editCount = 0;
	const modal = new ObservationsModal(createTestTheme(), items, details, () => {}, () => {
		editCount += 1;
	});

	modal.handleInput("e");

	assert.equal(editCount, 1);
});
