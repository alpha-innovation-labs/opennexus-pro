import assert from "node:assert/strict";
import test from "node:test";
import { buildStartupLogoLines } from "../../../packages/extensions/src/startup-logo/buildStartupLogoLines.js";
import { LinesComponent } from "../../support/component/LinesComponent.js";
import { renderComponentInVirtualTerminal } from "../../support/render/renderComponentInVirtualTerminal.js";
import { createTestTheme } from "../../support/theme/createTestTheme.js";

test("startup logo renders only the stylized Nexus wordmark", async () => {
	const viewport = await renderComponentInVirtualTerminal(
		() => new LinesComponent(() => buildStartupLogoLines(createTestTheme())),
		72,
		14,
	);

	const output = viewport.join("\n");
	assert.ok(output.includes(String.raw`███╗   ██╗███████╗██╗  ██╗██╗   ██╗███████╗`));
	assert.ok(output.includes(String.raw`████╗  ██║██╔════╝╚██╗██╔╝██║   ██║██╔════╝`));
	assert.ok(output.includes(String.raw`╚═╝  ╚═══╝╚══════╝╚═╝  ╚═╝ ╚═════╝ ╚══════╝`));
	assert.doesNotMatch(output, /⢀⣀⣤⣤⣤⣶/u);
	assert.doesNotMatch(output, /⣿/u);
});
