import { mkdir, writeFile } from "node:fs/promises";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import assert from "node:assert/strict";
import test from "node:test";
import { queryMemory } from "../../../packages/mini-apps/src/memory/query/queryMemory.js";
import { readMemoryReference } from "../../../packages/mini-apps/src/memory/storage/readMemoryReference.js";

test("queryMemory searches topic lines and returns linked references", async () => {
	const root = await mkdtemp(join(tmpdir(), "nexus-memory-query-"));
	await mkdir(join(root, "nexus", "references"), { recursive: true });
	await writeFile(join(root, "nexus", "marketing.md"), "- cursor-sdk.md: Cursor launch idea for marketing\n", "utf8");
	await writeFile(join(root, "nexus", "references", "cursor-sdk.md"), "raw cursor tweet", "utf8");

	const results = await queryMemory(root, "cursor", 10);

	assert.deepEqual(results, [{ project: "nexus", topic: "marketing", line: "- cursor-sdk.md: Cursor launch idea for marketing", referenceName: "cursor-sdk.md", referencePath: join(root, "nexus", "references", "cursor-sdk.md") }]);
});

test("readMemoryReference reads one raw reference", async () => {
	const root = await mkdtemp(join(tmpdir(), "nexus-memory-query-"));
	await mkdir(join(root, "nexus", "references"), { recursive: true });
	await writeFile(join(root, "nexus", "references", "cursor-sdk.md"), "raw cursor tweet", "utf8");

	assert.equal(await readMemoryReference(root, "nexus", "cursor-sdk.md"), "raw cursor tweet");
});
