import assert from "node:assert/strict";
import test from "node:test";
import { visibleWidth } from "@mariozechner/pi-tui";
import { buildStartupHeroLines } from "../../../packages/extensions/src/startup-hero/buildStartupHeroLines.js";
import { createTestTheme } from "../../support/theme/createTestTheme.js";

const chosenTip = "Press Ctrl+V to paste clipboard images.";

/**
 * Creates a strict theme that rejects unsupported Pi theme color names.
 *
 * @returns Theme stub with the Pi startup hero color contract.
 */
function createStrictStartupHeroTheme(): { fg(color: string, value: string): string; bold(value: string): string } {
	const allowedColors = new Set(["accent", "text"]);
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

test("startup hero shows version, one tip, skills, and AGENTS.md status below the logo", () => {
	const lines = buildStartupHeroLines(createTestTheme(), "1.2.3", { activeSkillCount: 3, agentsMdLoaded: true }, 43, chosenTip);
	const output = lines.join("\n");
	const tipLines = lines.filter((line) => line.includes("TIP"));

	assert.match(output, /███╗   ██/u);
	assert.match(output, /Nexus v1\.2\.3/u);
	assert.deepEqual(tipLines, [`TIP ${chosenTip}`]);
	assert.doesNotMatch(output, /Use @ to attach files/u);
	assert.match(output, /Skills \(3\) ✓  AGENTS\.md ✓/u);
	assert.doesNotMatch(output, /MCPs/u);
	assert.ok(lines.every((line) => visibleWidth(line) <= 43));
});

test("startup hero uses only Pi-supported theme colors", () => {
	const lines = buildStartupHeroLines(createStrictStartupHeroTheme(), "1.2.3", {
		activeSkillCount: 3,
		agentsMdLoaded: true,
	}, 43, chosenTip);

	assert.ok(lines.some((line) => line.includes("Nexus v1.2.3")));
});
