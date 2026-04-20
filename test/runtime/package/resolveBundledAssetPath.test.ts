import assert from "node:assert/strict";
import test from "node:test";
import { getConfiguredPackageDir } from "../../../src/runtime/package/getConfiguredPackageDir.js";
import { hasBunBinaryMarker } from "../../../src/runtime/package/hasBunBinaryMarker.js";
import { resolveBundledAssetPath } from "../../../src/runtime/package/resolveBundledAssetPath.js";

test("resolveBundledAssetPath uses source-relative paths outside bundled mode", () => {
  const resolvedPath = resolveBundledAssetPath(
    "file:///workspace/src/runtime/module.ts",
    "feature-flags.json",
    "../../feature-flags.json",
    { env: {}, execPath: "/Applications/Nexus/nexus" },
  );

  assert.equal(resolvedPath, "/workspace/feature-flags.json");
});

test("resolveBundledAssetPath uses the configured package dir override", () => {
  const resolvedPath = resolveBundledAssetPath(
    "file:///workspace/src/runtime/module.ts",
    "theme",
    "./",
    { env: { PI_PACKAGE_DIR: "/Applications/Nexus" }, execPath: "/Applications/Nexus/nexus" },
  );

  assert.equal(resolvedPath, "/Applications/Nexus/theme");
});

test("hasBunBinaryMarker recognizes Bun virtual filesystem URLs", () => {
  assert.equal(hasBunBinaryMarker("file:///$bunfs/root/nexus"), true);
  assert.equal(hasBunBinaryMarker("file:///workspace/src/index.ts"), false);
});

test("getConfiguredPackageDir expands the package override home path", () => {
  const configuredPath = getConfiguredPackageDir({ PI_PACKAGE_DIR: "~/nexus" }, "/Users/tester");

  assert.equal(configuredPath, "/Users/tester/nexus");
});
