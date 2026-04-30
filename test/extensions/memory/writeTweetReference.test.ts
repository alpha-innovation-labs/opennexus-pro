import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import assert from "node:assert/strict";
import test from "node:test";
import { writeTweetReference } from "../../../packages/extensions/src/memory/storage/writeTweetReference.js";

test("writeTweetReference creates Projects-compatible raw and distilled tweet notes", async () => {
	const root = await mkdtemp(join(tmpdir(), "nexus-memory-"));
	const paths = await writeTweetReference(root, {
		projectName: "Cursor SDK Research",
		projectDescription: "Research about the Cursor SDK.",
		kind: "app",
		appName: "Social Posting",
		featureName: "Tweets",
		tweetUrl: "https://x.com/a/status/123",
		title: "Useful Tweet",
		rawMarkdown: "Raw tweet body",
		distilledMarkdown: "- Distilled point",
		keywords: ["social", "idea"],
		updated: "2026-04-30",
	});

	assert.equal(paths.rawPath, join(root, "cursor-sdk-research", "apps", "social-posting", "features", "tweets", "reference", "raw", "useful-tweet.md"));
	assert.equal(paths.distilledPath, join(root, "cursor-sdk-research", "apps", "social-posting", "features", "tweets", "reference", "useful-tweet-distilled.md"));
	assert.match(await readFile(paths.rawPath, "utf8"), /## Source Capture\n\nRaw tweet body/);
	const index = await readFile(join(root, "cursor-sdk-research", "apps", "social-posting", "features", "tweets", "reference", "references.md"), "utf8");
	const distilled = await readFile(paths.distilledPath, "utf8");
	assert.match(index, /- useful-tweet-distilled\.md: - Distilled point/);
	assert.match(distilled, /keywords:\n  - social\n  - idea/);
	assert.match(distilled, /## Distilled information\n\n- Distilled point/);
});
