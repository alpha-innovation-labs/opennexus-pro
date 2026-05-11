import assert from "node:assert/strict";
import test from "node:test";
import { buildNexusSystemPrompt } from "../../packages/pi-platform/src/system-prompt/buildNexusSystemPrompt.js";

/** Verifies Nexus copies Pi's default prompt shape while removing Pi docs. */
test("Nexus default prompt omits Pi docs and uses AGENTS.md section", () => {
	const prompt = buildNexusSystemPrompt({
		cwd: "/repo",
		selectedTools: ["read", "bash", "grep"],
		toolSnippets: { read: "Read files", bash: "Run commands", grep: "Search files" },
		contextFiles: [{ path: "/repo/AGENTS.md", content: "Follow repo rules." }],
	});

	assert.match(prompt, /You are an expert coding assistant operating inside pi/u);
	assert.match(prompt, /Available tools:\n- read: Read files/u);
	assert.match(prompt, /Guidelines:/u);
	assert.doesNotMatch(prompt, /Pi documentation/u);
	assert.doesNotMatch(prompt, /# Project Context/u);
	assert.match(prompt, /# AGENTS\.md/u);
	assert.match(prompt, /## \/repo\/AGENTS\.md/u);
});
