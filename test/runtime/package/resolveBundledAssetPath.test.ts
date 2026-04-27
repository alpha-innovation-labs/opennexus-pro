import assert from "node:assert/strict";
import test from "node:test";
import { resolveBundledAssetPath } from "../../../packages/nexus-runtime/src/package/resolveBundledAssetPath.js";

test("resolveBundledAssetPath uses source-relative paths outside bundled mode", () => {
  const resolvedPath = resolveBundledAssetPath(
    "file:///workspace/packages/feature-flags/src/getFeatureFlagsConfigPath.ts",
    "feature-flags.json",
    "../../../feature-flags.json",
  );

  assert.equal(resolvedPath, "/workspace/feature-flags.json");
});

test("resolveBundledAssetPath uses the configured package dir override", () => {
  const previousPackageDir = process.env.PI_PACKAGE_DIR;
  process.env.PI_PACKAGE_DIR = "/opt/nexus";

  try {
    const resolvedPath = resolveBundledAssetPath("file:///snapshot/src/file.js", "theme/dark.json", "../../theme/dark.json");

    assert.equal(resolvedPath, "/opt/nexus/theme/dark.json");
  } finally {
    if (previousPackageDir === undefined) delete process.env.PI_PACKAGE_DIR;
    else process.env.PI_PACKAGE_DIR = previousPackageDir;
  }
});

test("hasBunBinaryMarker recognizes Bun virtual filesystem URLs", () => {
  const resolvedPath = resolveBundledAssetPath("file:///$bunfs/root/src/file.js", "assets/logo.png", "../../assets/logo.png");

  assert.match(resolvedPath, /assets\/logo\.png$/);
});
