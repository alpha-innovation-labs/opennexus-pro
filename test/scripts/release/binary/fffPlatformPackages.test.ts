import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { getFffPlatformPackageName } from "../../../../scripts/release/binary/getFffPlatformPackageName.mjs";
import { getFfiRsNativeBindingFilename } from "../../../../scripts/release/binary/getFfiRsNativeBindingFilename.mjs";
import { getFfiRsPlatformPackageName } from "../../../../scripts/release/binary/getFfiRsPlatformPackageName.mjs";

const FFF_PLATFORMS = [
  { platform: "darwin", arch: "arm64", expected: "@ff-labs/fff-bin-darwin-arm64" },
  { platform: "darwin", arch: "x64", expected: "@ff-labs/fff-bin-darwin-x64" },
  { platform: "linux", arch: "arm64", libc: "gnu", expected: "@ff-labs/fff-bin-linux-arm64-gnu" },
  { platform: "linux", arch: "arm64", libc: "musl", expected: "@ff-labs/fff-bin-linux-arm64-musl" },
  { platform: "linux", arch: "x64", libc: "gnu", expected: "@ff-labs/fff-bin-linux-x64-gnu" },
  { platform: "linux", arch: "x64", libc: "musl", expected: "@ff-labs/fff-bin-linux-x64-musl" },
  { platform: "win32", arch: "arm64", expected: "@ff-labs/fff-bin-win32-arm64" },
  { platform: "win32", arch: "x64", expected: "@ff-labs/fff-bin-win32-x64" },
] as const;

test("release FFF package mapping covers macOS Linux and Windows", () => {
  for (const entry of FFF_PLATFORMS) {
    assert.equal(getFffPlatformPackageName(entry), entry.expected);
  }
});

test("fff-node npm metadata declares all supported platform binaries", () => {
  const metadata = JSON.parse(readFileSync("node_modules/@ff-labs/fff-node/package.json", "utf8"));
  for (const entry of FFF_PLATFORMS) {
    assert.equal(metadata.optionalDependencies[entry.expected], metadata.version);
  }
  assert.deepEqual(metadata.os, ["darwin", "linux", "win32"]);
  assert.deepEqual(metadata.cpu, ["x64", "arm64"]);
});

test("release ffi-rs package mapping is not hardcoded to macOS", () => {
  assert.equal(getFfiRsPlatformPackageName({ platform: "linux", arch: "x64", libc: "gnu" }), "@yuuang/ffi-rs-linux-x64-gnu");
  assert.equal(getFfiRsPlatformPackageName({ platform: "win32", arch: "arm64" }), "@yuuang/ffi-rs-win32-arm64-msvc");
  assert.equal(getFfiRsNativeBindingFilename({ platform: "linux", arch: "arm64", libc: "musl" }), "ffi-rs.linux-arm64-musl.node");
});
