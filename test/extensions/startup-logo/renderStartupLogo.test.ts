import assert from "node:assert/strict";
import test from "node:test";
import { buildStartupLogoLines } from "../../../src/extensions/startup-logo/buildStartupLogoLines.js";
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
	assert.ok(output.includes(String.raw` _   _  _____ __  __ _   _  ____ `));
	assert.ok(output.includes(String.raw`| \ | || ____|\ \/ /| | | |/ ___|`));
	assert.ok(output.includes(String.raw`|_| \_||_____|/_/\_\ \___/ |____/ `));
	assert.doesNotMatch(output, /⢀⣀⣤⣤⣤⣶/u);
	assert.doesNotMatch(output, /⣿/u);
});
