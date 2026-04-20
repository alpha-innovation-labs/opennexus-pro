import assert from "node:assert/strict";
import test from "node:test";
import { getPiSpawnCommand } from "../../../src/extensions/sub-agents/vendor/pi-spawn.js";

test("getPiSpawnCommand prefers an explicit compiled binary path", () => {
  const command = getPiSpawnCommand(["--help"], { binaryPath: "/Applications/Nexus/nexus" });

  assert.deepEqual(command, {
    command: "/Applications/Nexus/nexus",
    args: ["--help"],
  });
});

test("getPiSpawnCommand falls back to the pi CLI outside bundled mode", () => {
  const command = getPiSpawnCommand(["--help"], {
    argv1: "/workspace/dist/index.js",
    existsSync: () => false,
    resolvePackageJson: () => {
      throw new Error("package lookup disabled for test");
    },
  });

  assert.deepEqual(command, {
    command: "pi",
    args: ["--help"],
  });
});
