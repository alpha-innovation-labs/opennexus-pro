import assert from "node:assert/strict";
import test from "node:test";
import { visibleWidth } from "@mariozechner/pi-tui";
import { buildStartupHeroLines } from "../../../packages/extensions/src/startup-hero/buildStartupHeroLines.js";
import { createTestTheme } from "../../support/theme/createTestTheme.js";

test("startup hero shows version, tips, skills, and AGENTS.md status below the logo", () => {
	const lines = buildStartupHeroLines(createTestTheme(), "1.2.3", { activeSkillCount: 3, agentsMdLoaded: true }, 43);
	const output = lines.join("\n");

	assert.match(output, /███╗   ██/u);
	assert.match(output, /Nexus v1\.2\.3/u);
	assert.match(output, /TIP/u);
	assert.match(output, /Use @ to attach files/u);
	assert.match(output, /3 active skills • AGENTS\.md active/u);
	assert.ok(lines.every((line) => visibleWidth(line) <= 43));
});
