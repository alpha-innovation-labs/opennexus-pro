import assert from "node:assert/strict";
import test from "node:test";
import { GroupedLoginActionSelector } from "../../../packages/pi-platform/src/login-import/ui/GroupedLoginActionSelector.js";
import { createLoginActionGroups } from "../../../packages/pi-platform/src/login-import/ui/createLoginActionGroups.js";
import { createLoginImportActionGroups } from "../../../packages/pi-platform/src/login-import/ui/createLoginImportActionGroups.js";
import { renderComponentInVirtualTerminal } from "../../support/render/renderComponentInVirtualTerminal.js";

test("/login action selector shows import sources directly above providers", async () => {
	const viewport = await renderComponentInVirtualTerminal(
		() => new GroupedLoginActionSelector("Select authentication action:", createLoginActionGroups(), () => {}, () => {}),
		100,
		20,
	);
	const output = viewport.join("\n");

	assert.match(output, /Import/u);
	assert.match(output, /→ Import from Pi/u);
	assert.match(output, /Import from OpenCode/u);
	assert.match(output, /Providers/u);
	assert.match(output, /Use a subscription/u);
	assert.match(output, /Use an API key/u);
	assert.ok(output.indexOf("Import") < output.indexOf("Providers"));
});

test("/login import helper group chooses OpenCode import after moving down", () => {
	let selected = "";
	const selector = new GroupedLoginActionSelector("Select import source:", createLoginImportActionGroups(), (action) => {
		selected = action.kind === "import" ? action.source : "";
	}, () => {});

	selector.handleInput("j");
	selector.handleInput("\r");

	assert.equal(selected, "opencode");
});
