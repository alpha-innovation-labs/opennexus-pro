import { join } from "node:path";
import assert from "node:assert/strict";
import test from "node:test";
import { resolveReferenceDirectory } from "../../../packages/extensions/src/memory/storage/resolveReferenceDirectory.js";

test("resolveReferenceDirectory nests packages inside a memory project", () => {
	const path = resolveReferenceDirectory("/memory", {
		projectName: "Cursor SDK Research",
		kind: "package",
		packageGroup: "AI SDK",
		packageName: "Cursor SDK",
		tweetUrl: "https://x.com/a/status/1",
		title: "Cursor SDK Announcement",
		rawMarkdown: "raw",
		distilledMarkdown: "distilled",
		updated: "2026-04-30",
	});
	assert.equal(path, join("/memory", "cursor-sdk-research", "packages", "ai-sdk", "cursor-sdk", "reference"));
});
