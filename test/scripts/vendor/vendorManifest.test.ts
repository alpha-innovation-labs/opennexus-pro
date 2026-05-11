import assert from "node:assert/strict";
import test from "node:test";
import { readVendorManifest } from "../../../scripts/vendor/readVendorManifest.mjs";

test("vendor manifest has no bundled third-party extension packages", async () => {
	const entries = await readVendorManifest();

	assert.deepEqual(entries, []);
});
