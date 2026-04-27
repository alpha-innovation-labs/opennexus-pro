import assert from "node:assert/strict";
import { mkdtemp, readdir, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import test from "node:test";
import { copyPiThemeAssets } from "../../../../scripts/release/binary/copyPiThemeAssets.mjs";

test("copyPiThemeAssets excludes non-theme schema JSON files", async () => {
  const targetRoot = await mkdtemp(join(tmpdir(), "nexus-pi-themes-"));

  try {
    await copyPiThemeAssets(targetRoot);

    const copiedThemeFiles = await readdir(join(targetRoot, "theme"));

    assert.ok(copiedThemeFiles.includes("dark.json"));
    assert.ok(copiedThemeFiles.includes("light.json"));
    assert.equal(copiedThemeFiles.includes("theme-schema.json"), false);
  } finally {
    await rm(targetRoot, { recursive: true, force: true });
  }
});
