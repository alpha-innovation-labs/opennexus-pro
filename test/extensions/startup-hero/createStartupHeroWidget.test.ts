import assert from "node:assert/strict";
import test from "node:test";
import { visibleWidth } from "@mariozechner/pi-tui";
import { createStartupHeroWidget } from "../../../packages/extensions/src/startup-hero/createStartupHeroWidget.js";
import { createTestTheme } from "../../support/theme/createTestTheme.js";

test("startup hero widget renders logo, version, one tip, and status above the prompt", () => {
	const widget = createStartupHeroWidget(
		{ terminal: { rows: 40 } } as never,
		createTestTheme(),
		"1.2.3",
		{
			activeSkillCount: 3,
			agentsMdLoaded: true,
		},
		"Press Ctrl+V to paste clipboard images.",
	);
	const lines = widget.render(100);
	const output = lines.join("\n");

	assert.equal(lines.length, 17);
	assert.match(output, /███╗   ██╗███████╗██╗  ██╗██╗   ██╗███████╗/u);
	assert.match(output, /v1\.2\.3/u);
	assert.doesNotMatch(output, /Nexus v/u);
	assert.match(output, /TIP Press Ctrl\+V to paste clipboard images\./u);
	assert.match(output, /Skills \(3\) ✓  AGENTS\.md ✓/u);
	assert.equal(visibleWidth(lines.at(-1)!), 100);
});

test("startup hero widget keeps the top of the N aligned with the lower rows", () => {
	const widget = createStartupHeroWidget(
		{ terminal: { rows: 40 } } as never,
		createTestTheme(),
		"1.2.3",
		{
			activeSkillCount: 3,
			agentsMdLoaded: true,
		},
		"Press Ctrl+V to paste clipboard images.",
	);
	const logoLines = widget.render(100).filter((line) => line.trim().length > 0);
	const topRowStart = logoLines[0]!.indexOf("█");
	const lowerRowStart = logoLines[1]!.indexOf("█");

	assert.equal(topRowStart, lowerRowStart);
});
