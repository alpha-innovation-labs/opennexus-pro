import { mkdir, readdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import assert from "node:assert/strict";
import test from "node:test";
import { mkdtemp } from "node:fs/promises";
import { deleteMemoryFile } from "../../../packages/extensions/src/memory/storage/deleteMemoryFile.js";

test("deleteMemoryFile removes empty parent folders up to memory root", async () => {
	const root = await mkdtemp(join(tmpdir(), "nexus-memory-delete-"));
	const nested = join(root, "project", "apps", "app", "reference", "raw");
	const file = join(nested, "tweet.md");
	await mkdir(nested, { recursive: true });
	await writeFile(file, "tweet", "utf8");

	await deleteMemoryFile(file, root);

	assert.deepEqual(await readdir(root), []);
});

test("deleteMemoryFile keeps non-empty parent folders", async () => {
	const root = await mkdtemp(join(tmpdir(), "nexus-memory-delete-"));
	const nested = join(root, "project", "reference");
	const file = join(nested, "tweet.md");
	await mkdir(nested, { recursive: true });
	await writeFile(file, "tweet", "utf8");
	await writeFile(join(nested, "other.md"), "other", "utf8");

	await deleteMemoryFile(file, root);

	assert.deepEqual(await readdir(nested), ["other.md"]);
});
