import assert from "node:assert/strict";
import test from "node:test";
import { readVendorManifest } from "../../../scripts/vendor/readVendorManifest.mjs";

const expectedSources = new Map([
  ["websearch", "pi-web-access"],
  ["mcp-adapter", "pi-mcp-adapter"],
  ["rpiv-todo", "@juicesharp/rpiv-todo"],
  ["rpiv-ask-user-question", "@juicesharp/rpiv-ask-user-question"],
  ["pi-lens", "pi-lens"],
]);

test("vendor manifest tracks supported third-party extension packages", async () => {
  const entries = await readVendorManifest();
  const sourcesById = new Map(entries.map((entry) => [entry.id, entry.source]));

  assert.deepEqual(sourcesById, expectedSources);
});
