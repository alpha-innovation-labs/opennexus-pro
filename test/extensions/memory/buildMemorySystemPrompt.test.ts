import assert from "node:assert/strict";
import test from "node:test";
import { buildMemorySystemPrompt } from "../../../packages/extensions/src/memory/prompt/buildMemorySystemPrompt.js";

test("buildMemorySystemPrompt adds tweet memory instructions for Twitter links", () => {
	const prompt = buildMemorySystemPrompt("save https://x.com/user/status/123 please");
	assert.match(prompt ?? "", /memory_fetch_tweet/);
	assert.match(prompt ?? "", /memory_list_projects/);
	assert.match(prompt ?? "", /memory_add_tweet/);
	assert.match(prompt ?? "", /https:\/\/x.com\/user\/status\/123/);
});

test("buildMemorySystemPrompt skips prompts without tweets", () => {
	assert.equal(buildMemorySystemPrompt("hello"), undefined);
});
