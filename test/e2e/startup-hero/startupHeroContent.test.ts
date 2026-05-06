import assert from "node:assert/strict";
import test from "node:test";
import { buildCenteredStartupHeroLines } from "../../../packages/extensions/src/startup-hero/buildCenteredStartupHeroLines.js";
import { LinesComponent } from "../../support/component/LinesComponent.js";
import { renderComponentInVirtualTerminal } from "../../support/render/renderComponentInVirtualTerminal.js";
import { createTestTheme } from "../../support/theme/createTestTheme.js";

test("startup hero renders version, skills, AGENTS.md, extension status, and mini-app status in the terminal", async () => {
	const viewport = await renderComponentInVirtualTerminal(
		() =>
			new LinesComponent(() =>
				buildCenteredStartupHeroLines(
					createTestTheme(),
					32,
					96,
					"1.2.3",
					{
						activeSkillCount: 4,
						agentsMdLoaded: true,
						enabledExtensionCount: 10,
						enabledMiniAppCount: 5,
					},
				),
			),
		96,
		32,
	);
	const output = viewport.join("\n");

	assert.match(output, /v1\.2\.3/u);
	assert.doesNotMatch(output, /Nexus v/u);
	assert.doesNotMatch(output, /TIP/u);
	assert.doesNotMatch(output, /Use @ to attach files/u);
	assert.match(output, /󰧑 Skills \(4\) ✓   AGENTS\.md ✓   Extensions \(10\) ✓  󱂬 Mini-Apps \(5\) ✓/u);
});
