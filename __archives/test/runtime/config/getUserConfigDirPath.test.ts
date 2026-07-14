import assert from "node:assert/strict";
import { homedir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { getUserConfigDirPath } from "../../../packages/nexus-runtime/src/config/getUserConfigDirPath.js";

/**
 * Restores supported user-config environment variables.
 *
 * @param nexusValue Previous Nexus config env value.
 */
function restoreUserConfigEnv(nexusValue: string | undefined): void {
  if (nexusValue === undefined) {
    delete process.env.NEXUS_CONFIG_DIR;
  } else {
    process.env.NEXUS_CONFIG_DIR = nexusValue;
  }
}

test("getUserConfigDirPath prefers the Nexus config env override", () => {
  const previousNexus = process.env.NEXUS_CONFIG_DIR;
  process.env.NEXUS_CONFIG_DIR = "/tmp/nexus-config";

  try {
    assert.equal(getUserConfigDirPath(), "/tmp/nexus-config");
  } finally {
    restoreUserConfigEnv(previousNexus);
  }
});

test("getUserConfigDirPath falls back to ~/.config/nexus", () => {
  const previousNexus = process.env.NEXUS_CONFIG_DIR;
  delete process.env.NEXUS_CONFIG_DIR;

  try {
    assert.equal(getUserConfigDirPath(), join(homedir(), ".config", "nexus"));
  } finally {
    restoreUserConfigEnv(previousNexus);
  }
});
