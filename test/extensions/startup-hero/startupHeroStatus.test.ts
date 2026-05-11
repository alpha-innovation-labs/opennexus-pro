import assert from "node:assert/strict";
import test from "node:test";
import { getStartupHeroStatus } from "../../../packages/extension-core/src/startup-hero/getStartupHeroStatus.js";

test("startup hero status counts active skills, AGENTS.md, extensions, and mini-apps", () => {
	const status = getStartupHeroStatus([
		"# Project Context",
		"## /workspace/AGENTS.md",
		"<available_skills>",
		"  <skill>",
		"    <name>nexus</name>",
		"  </skill>",
		"  <skill>",
		"    <name>software-engineering</name>",
		"  </skill>",
		"</available_skills>",
	].join("\n"));

	assert.equal(status.activeSkillCount, 2);
	assert.equal(status.agentsMdLoaded, true);
	assert.ok(status.enabledExtensionCount > 0);
	assert.ok(status.enabledMiniAppCount > 0);
});

test("startup hero status handles no active project context", () => {
	const status = getStartupHeroStatus("Current working directory: /workspace");

	assert.equal(status.activeSkillCount, 0);
	assert.equal(status.agentsMdLoaded, false);
	assert.ok(status.enabledExtensionCount > 0);
	assert.ok(status.enabledMiniAppCount > 0);
});
