import assert from "node:assert/strict";
import test from "node:test";
import { homedir } from "node:os";
import { join } from "node:path";
import { ensureAgentDirEnv } from "../../../src/runtime/config/ensureAgentDirEnv.js";
import { getAgentDirPath } from "../../../src/runtime/config/getAgentDirPath.js";

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

test("getAgentDirPath prefers the Nexus env override", () => {
  const previousNexus = process.env.NEXUS_CODING_AGENT_DIR;
  const previousPi = process.env.PI_CODING_AGENT_DIR;
  process.env.NEXUS_CODING_AGENT_DIR = "/tmp/nexus-agent";
  process.env.PI_CODING_AGENT_DIR = "/tmp/pi-agent";

  try {
    assert.equal(getAgentDirPath(), "/tmp/nexus-agent");
  } finally {
    restoreAgentDirEnv(previousNexus, previousPi);
  }
});

test("getAgentDirPath falls back to the Pi env override", () => {
  const previousNexus = process.env.NEXUS_CODING_AGENT_DIR;
  const previousPi = process.env.PI_CODING_AGENT_DIR;
  delete process.env.NEXUS_CODING_AGENT_DIR;
  process.env.PI_CODING_AGENT_DIR = "/tmp/pi-agent";

  try {
    assert.equal(getAgentDirPath(), "/tmp/pi-agent");
  } finally {
    restoreAgentDirEnv(previousNexus, previousPi);
  }
});

test("getAgentDirPath falls back to the installed Nexus agent dir", () => {
  const previousNexus = process.env.NEXUS_CODING_AGENT_DIR;
  const previousPi = process.env.PI_CODING_AGENT_DIR;
  delete process.env.NEXUS_CODING_AGENT_DIR;
  delete process.env.PI_CODING_AGENT_DIR;

  try {
    assert.equal(getAgentDirPath(), join(homedir(), ".local", "share", "nexus", "agent"));
  } finally {
    restoreAgentDirEnv(previousNexus, previousPi);
  }
});

test("ensureAgentDirEnv populates both supported env vars", () => {
  const previousNexus = process.env.NEXUS_CODING_AGENT_DIR;
  const previousPi = process.env.PI_CODING_AGENT_DIR;
  delete process.env.NEXUS_CODING_AGENT_DIR;
  delete process.env.PI_CODING_AGENT_DIR;

  try {
    const agentDir = ensureAgentDirEnv();
    assert.equal(agentDir, join(homedir(), ".local", "share", "nexus", "agent"));
    assert.equal(process.env.NEXUS_CODING_AGENT_DIR, agentDir);
    assert.equal(process.env.PI_CODING_AGENT_DIR, agentDir);
  } finally {
    restoreAgentDirEnv(previousNexus, previousPi);
  }
});
