import assert from "node:assert/strict";
import test from "node:test";
import { buildStartupLogoLines } from "../../../src/extensions/startup-logo/buildStartupLogoLines.js";
import { LinesComponent } from "../../support/component/LinesComponent.js";
import { renderComponentInVirtualTerminal } from "../../support/render/renderComponentInVirtualTerminal.js";
import { createTestTheme } from "../../support/theme/createTestTheme.js";

test("startup logo keeps the full orbit while replacing only the center mark with N", async () => {
	const viewport = await renderComponentInVirtualTerminal(
		() => new LinesComponent(() => buildStartupLogoLines(createTestTheme())),
		80,
		24,
	);

	const output = viewport.join("\n");
	assert.match(output, /⢀⣀⣤⣤⣤⣶/u);
	assert.match(output, /⢸⣿⡿⣿⣄ ⣿⡇/u);
	assert.match(output, /⠹⣿⣧/u);
});
