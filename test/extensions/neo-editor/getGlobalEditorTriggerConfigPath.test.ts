import assert from "node:assert/strict";
import test from "node:test";
import { homedir } from "node:os";
import { join } from "node:path";
import { getGlobalEditorTriggerConfigPath } from "../../../src/extensions/neo-editor/editor-triggers/getGlobalEditorTriggerConfigPath.js";

/**
 * Restores the supported agent-dir environment variables.
 *
 * @param nexusValue Previous Nexus env value.
 * @param piValue Previous Pi env value.
 */
function restoreAgentDirEnv(nexusValue: string | undefined, piValue: string | undefined): void {
  if (nexusValue === undefined) {
    delete process.env.NEXUS_CODING_AGENT_DIR;
  } else {
    process.env.NEXUS_CODING_AGENT_DIR = nexusValue;
  }

  if (piValue === undefined) {
    delete process.env.PI_CODING_AGENT_DIR;
  } else {
    process.env.PI_CODING_AGENT_DIR = piValue;
  }
}

test("getGlobalEditorTriggerConfigPath uses the Nexus agent dir env override", () => {
  const previousNexus = process.env.NEXUS_CODING_AGENT_DIR;
  const previousPi = process.env.PI_CODING_AGENT_DIR;
  process.env.NEXUS_CODING_AGENT_DIR = "/tmp/nexus-agent";
  process.env.PI_CODING_AGENT_DIR = "/tmp/pi-agent";

  try {
    assert.equal(getGlobalEditorTriggerConfigPath(), "/tmp/nexus-agent/editor-triggers.json");
  } finally {
    restoreAgentDirEnv(previousNexus, previousPi);
  }
});

test("getGlobalEditorTriggerConfigPath falls back to the default Nexus agent dir", () => {
  const previousNexus = process.env.NEXUS_CODING_AGENT_DIR;
  const previousPi = process.env.PI_CODING_AGENT_DIR;
  delete process.env.NEXUS_CODING_AGENT_DIR;
  delete process.env.PI_CODING_AGENT_DIR;

  try {
    assert.equal(getGlobalEditorTriggerConfigPath(), join(homedir(), ".nexus", "agent", "editor-triggers.json"));
  } finally {
    restoreAgentDirEnv(previousNexus, previousPi);
  }
});
