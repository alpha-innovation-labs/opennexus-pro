import assert from "node:assert/strict";
import test from "node:test";
import { homedir } from "node:os";
import { join } from "node:path";
import { getGlobalEditorTriggerConfigPath } from "../../../packages/extension-core/src/neo-editor/features/editor-triggers/getGlobalEditorTriggerConfigPath.js";

/**
 * Restores the supported config-dir environment variable.
 *
 * @param nexusValue Previous Nexus config env value.
 */
function restoreConfigDirEnv(nexusValue: string | undefined): void {
  if (nexusValue === undefined) {
    delete process.env.NEXUS_CONFIG_DIR;
  } else {
    process.env.NEXUS_CONFIG_DIR = nexusValue;
  }
}

test("getGlobalEditorTriggerConfigPath uses the Nexus config dir env override", () => {
  const previousNexus = process.env.NEXUS_CONFIG_DIR;
  process.env.NEXUS_CONFIG_DIR = "/tmp/nexus-config";

  try {
    assert.equal(getGlobalEditorTriggerConfigPath(), "/tmp/nexus-config/editor-triggers.json");
  } finally {
    restoreConfigDirEnv(previousNexus);
  }
});

test("getGlobalEditorTriggerConfigPath falls back to the installed Nexus config dir", () => {
  const previousNexus = process.env.NEXUS_CONFIG_DIR;
  delete process.env.NEXUS_CONFIG_DIR;

  try {
    assert.equal(getGlobalEditorTriggerConfigPath(), join(homedir(), ".config", "nexus", "editor-triggers.json"));
  } finally {
    restoreConfigDirEnv(previousNexus);
  }
});
