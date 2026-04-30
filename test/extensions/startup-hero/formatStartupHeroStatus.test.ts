import assert from "node:assert/strict";
import test from "node:test";
import { formatStartupHeroStatus } from "../../../packages/extensions/src/startup-hero/formatStartupHeroStatus.js";

test("startup hero status uses compact skills, AGENTS.md, and extension icons without MCPs", () => {
	assert.equal(formatStartupHeroStatus({ activeSkillCount: 1, agentsMdLoaded: true, enabledExtensionCount: 10 }), "󰧑 Skills (1) ✓   AGENTS.md ✓   Extensions (10) ✓");
	assert.equal(formatStartupHeroStatus({ activeSkillCount: 0, agentsMdLoaded: false, enabledExtensionCount: 0 }), "󰧑 Skills (0) ✗   AGENTS.md ✗   Extensions (0) ✗");
	assert.doesNotMatch(formatStartupHeroStatus({ activeSkillCount: 1, agentsMdLoaded: true, enabledExtensionCount: 10 }), /MCPs/u);
});
