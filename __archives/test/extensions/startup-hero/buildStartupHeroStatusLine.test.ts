import assert from "node:assert/strict";
import test from "node:test";
import { visibleWidth } from "@earendil-works/pi-tui";
import { buildStartupHeroStatusLine } from "../../../packages/extension-core/src/startup-hero/buildStartupHeroStatusLine.js";

/**
 * Creates a theme that exposes tool diff summary colors as ANSI codes.
 *
 * @returns Theme stub for status color assertions.
 */
function createStatusColorTheme(): { fg(color: string, value: string): string } {
	return {
		fg(color: string, value: string): string {
			if (color === "syntaxType") return `\u001b[36m${value}\u001b[39m`;
			if (color === "error") return `\u001b[31m${value}\u001b[39m`;
			if (color === "success" || color === "toolDiffAdded" || color === "toolDiffRemoved") {
				throw new Error(`Unexpected status color: ${color}`);
			}
			return value;
		},
	};
}

test("startup hero status uses tool diff summary colors for check and x icons", () => {
	const active = buildStartupHeroStatusLine(createStatusColorTheme(), { activeSkillCount: 1, agentsMdLoaded: true, enabledExtensionCount: 10, enabledMiniAppCount: 5 }, 120);
	const inactive = buildStartupHeroStatusLine(createStatusColorTheme(), { activeSkillCount: 0, agentsMdLoaded: false, enabledExtensionCount: 0, enabledMiniAppCount: 0 }, 120);

	assert.equal(active, "󰧑 Skills (1) \u001b[36m✓\u001b[39m   AGENTS.md \u001b[36m✓\u001b[39m   Extensions (10) \u001b[36m✓\u001b[39m  󱂬 Mini-Apps (5) \u001b[36m✓\u001b[39m");
	assert.equal(inactive, "󰧑 Skills (0) \u001b[31m✗\u001b[39m   AGENTS.md \u001b[31m✗\u001b[39m   Extensions (0) \u001b[31m✗\u001b[39m  󱂬 Mini-Apps (0) \u001b[31m✗\u001b[39m");
	assert.equal(visibleWidth(active), 69);
});
