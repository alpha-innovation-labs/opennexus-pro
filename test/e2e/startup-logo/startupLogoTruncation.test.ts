import assert from "node:assert/strict";
import test from "node:test";
import { buildStartupLogoLines } from "../../../packages/extensions/src/startup-logo/buildStartupLogoLines.js";
import { LinesComponent } from "../../support/component/LinesComponent.js";
import { renderComponentInVirtualTerminal } from "../../support/render/renderComponentInVirtualTerminal.js";
import { createTestTheme } from "../../support/theme/createTestTheme.js";

test("startup logo keeps the Nexus wordmark readable at narrow terminal widths", async () => {
	const viewport = await renderComponentInVirtualTerminal(
		() => new LinesComponent(() => buildStartupLogoLines(createTestTheme())),
		42,
		14,
	);

	const output = viewport.join("\n");
	assert.match(output, /███╗   ██/u);
	assert.match(output, /╚═╝  ╚══/u);
	assert.doesNotMatch(output, /⣿/u);
});
