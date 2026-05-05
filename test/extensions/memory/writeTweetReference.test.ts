import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import assert from "node:assert/strict";
import test from "node:test";
import { writeTweetReference } from "../../../packages/extensions/src/memory/storage/writeTweetReference.js";

test("writeTweetReference creates raw reference and topic note", async () => {
	const root = await mkdtemp(join(tmpdir(), "nexus-memory-"));
	const paths = await writeTweetReference(root, {
		projectName: "Nexus",
		projectDescription: "Research about Nexus.",
		topicName: "Marketing",
		tweetUrl: "https://x.com/a/status/123",
		title: "Useful Tweet",
		rawMarkdown: "Raw tweet body",
		distilledMarkdown: "Distilled point",
		keywords: ["social", "idea"],
		updated: "2026-04-30",
	});

	assert.equal(paths.referencePath, join(root, "nexus", "references", "useful-tweet.md"));
	assert.equal(paths.topicPath, join(root, "nexus", "marketing.md"));
	assert.match(await readFile(paths.referencePath, "utf8"), /## Source Capture\n\nRaw tweet body/);
	assert.match(await readFile(paths.topicPath, "utf8"), /- useful-tweet\.md: Distilled point/);
});
