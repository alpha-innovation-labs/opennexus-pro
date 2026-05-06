import assert from "node:assert/strict";
import test from "node:test";
import { visibleWidth } from "@mariozechner/pi-tui";
import { buildStartupHeroLines } from "../../../packages/extensions/src/startup-hero/buildStartupHeroLines.js";
import { createTestTheme } from "../../support/theme/createTestTheme.js";

/**
 * Creates a strict theme that rejects unsupported Pi theme color names.
 *
 * @returns Theme stub with the Pi startup hero color contract.
 */
function createStrictStartupHeroTheme(): { fg(color: string, value: string): string; bold(value: string): string } {
	const allowedColors = new Set(["accent", "text", "thinkingText", "syntaxType", "error"]);
	return {
		fg(color: string, value: string): string {
			if (!allowedColors.has(color)) throw new Error(`Unknown theme color: ${color}`);
			return value;
		},
		bold(value: string): string {
			return value;
		},
	};
}

test("startup hero shows version, skills, AGENTS.md, extension status, and mini-app status below the logo", () => {
	const lines = buildStartupHeroLines(createTestTheme(), "1.2.3", { activeSkillCount: 3, agentsMdLoaded: true, enabledExtensionCount: 10, enabledMiniAppCount: 5 }, 100);
	const output = lines.join("\n");

	assert.match(output, /███╗   ██/u);
	assert.match(output, /v1\.2\.3/u);
	assert.doesNotMatch(output, /Nexus v/u);
	assert.doesNotMatch(output, /TIP/u);
	assert.doesNotMatch(output, /Use @ to attach files/u);
	assert.match(output, /󰧑 Skills \(3\) ✓   AGENTS\.md ✓   Extensions \(10\) ✓  󱂬 Mini-Apps \(5\) ✓/u);
	assert.doesNotMatch(output, /MCPs/u);
	assert.ok(lines.every((line) => visibleWidth(line) <= 100));
});

test("startup hero uses only Pi-supported theme colors", () => {
	const lines = buildStartupHeroLines(createStrictStartupHeroTheme(), "1.2.3", {
		activeSkillCount: 3,
		agentsMdLoaded: true,
		enabledExtensionCount: 10,
		enabledMiniAppCount: 5,
	}, 100, "[⏱ 2:26]");

	assert.ok(lines.some((line) => line.includes("v1.2.3 [⏱ 2:26]")));
});
