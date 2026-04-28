import assert from "node:assert/strict";
import test from "node:test";
import { formatStartupHeroStatus } from "../../../packages/extensions/src/startup-hero/formatStartupHeroStatus.js";

test("startup hero status uses compact skills and AGENTS.md icons without MCPs", () => {
	assert.equal(formatStartupHeroStatus({ activeSkillCount: 1, agentsMdLoaded: true }), "Skills (1) ✓  AGENTS.md ✓");
	assert.equal(formatStartupHeroStatus({ activeSkillCount: 0, agentsMdLoaded: false }), "Skills (0) ✓  AGENTS.md ✗");
	assert.doesNotMatch(formatStartupHeroStatus({ activeSkillCount: 1, agentsMdLoaded: true }), /MCPs/u);
});
