import assert from "node:assert/strict";
import test from "node:test";
import { visibleWidth } from "@mariozechner/pi-tui";
import { buildStartupHeroStatusLine } from "../../../packages/extensions/src/startup-hero/buildStartupHeroStatusLine.js";

/**
 * Creates a theme that exposes success and error colors as ANSI codes.
 *
 * @returns Theme stub for status color assertions.
 */
function createStatusColorTheme(): { fg(color: string, value: string): string } {
	return {
		fg(color: string, value: string): string {
			if (color === "success") return `\u001b[32m${value}\u001b[39m`;
			if (color === "error") return `\u001b[31m${value}\u001b[39m`;
			return value;
		},
	};
}

test("startup hero status colors check and x icons", () => {
	const active = buildStartupHeroStatusLine(createStatusColorTheme(), { activeSkillCount: 1, agentsMdLoaded: true }, 80);
	const inactive = buildStartupHeroStatusLine(createStatusColorTheme(), { activeSkillCount: 0, agentsMdLoaded: false }, 80);

	assert.equal(active, "Skills (1) \u001b[32m✓\u001b[39m  AGENTS.md \u001b[32m✓\u001b[39m");
	assert.equal(inactive, "Skills (0) \u001b[31m✗\u001b[39m  AGENTS.md \u001b[31m✗\u001b[39m");
	assert.equal(visibleWidth(active), "Skills (1) ✓  AGENTS.md ✓".length);
});
