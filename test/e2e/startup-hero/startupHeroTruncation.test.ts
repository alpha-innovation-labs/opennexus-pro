import assert from "node:assert/strict";
import test from "node:test";
import { visibleWidth } from "@mariozechner/pi-tui";
import { buildCenteredStartupHeroLines } from "../../../packages/extensions/src/startup-hero/buildCenteredStartupHeroLines.js";
import { buildStartupHeroLogoLines } from "../../../packages/extensions/src/startup-hero/buildStartupHeroLogoLines.js";
import { LinesComponent } from "../../support/component/LinesComponent.js";
import { renderComponentInVirtualTerminal } from "../../support/render/renderComponentInVirtualTerminal.js";
import { createTestTheme } from "../../support/theme/createTestTheme.js";

const startupStatus = {
	activeSkillCount: 3,
	agentsMdLoaded: true,
	enabledExtensionCount: 10,
	enabledMiniAppCount: 5,
};

test("startup hero keeps the Nexus wordmark readable at narrow terminal widths", async () => {
	const viewport = await renderComponentInVirtualTerminal(
		() => new LinesComponent(() => buildStartupHeroLogoLines(createTestTheme())),
		42,
		14,
	);

	const output = viewport.join("\n");
	assert.match(output, /███╗   ██/u);
	assert.match(output, /╚═╝  ╚══/u);
	assert.doesNotMatch(output, /⣿/u);
});

test("startup hero renders full-width centered lines", () => {
	const terminalColumns = 72;
	const lines = buildCenteredStartupHeroLines(
		createTestTheme(),
		30,
		terminalColumns,
		"1.2.3",
		startupStatus,
	);

	assert.ok(lines.length > 0);
	assert.ok(lines.every((line) => visibleWidth(line) === terminalColumns));
	assert.ok(lines.some((line) => line.match(/^\s+v1\.2\.3\s+$/u)));
});

test("startup hero is hidden when the terminal is narrower than the wordmark", () => {
	const terminalColumns = 39;
	const lines = buildCenteredStartupHeroLines(
		createTestTheme(),
		30,
		terminalColumns,
		"1.2.3",
		startupStatus,
	);

	assert.deepEqual(lines, []);
	assert.ok(lines.every((line) => visibleWidth(line) <= terminalColumns));
});
