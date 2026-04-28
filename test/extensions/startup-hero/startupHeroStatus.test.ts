import assert from "node:assert/strict";
import test from "node:test";
import { getStartupHeroStatus } from "../../../packages/extensions/src/startup-hero/getStartupHeroStatus.js";

test("startup hero status counts active skills and detects AGENTS.md", () => {
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

	assert.deepEqual(status, { activeSkillCount: 2, agentsMdLoaded: true });
});

test("startup hero status handles no active project context", () => {
	const status = getStartupHeroStatus("Current working directory: /workspace");

	assert.deepEqual(status, { activeSkillCount: 0, agentsMdLoaded: false });
});
