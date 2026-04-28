import assert from "node:assert/strict";
import test from "node:test";
import { buildStartupHeroLogoLines } from "../../../packages/extensions/src/startup-hero/buildStartupHeroLogoLines.js";
import { LinesComponent } from "../../support/component/LinesComponent.js";
import { renderComponentInVirtualTerminal } from "../../support/render/renderComponentInVirtualTerminal.js";
import { createTestTheme } from "../../support/theme/createTestTheme.js";

test("startup hero renders only the stylized Nexus wordmark", async () => {
	const viewport = await renderComponentInVirtualTerminal(
		() => new LinesComponent(() => buildStartupHeroLogoLines(createTestTheme())),
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
