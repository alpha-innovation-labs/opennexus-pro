import assert from "node:assert/strict";
import test from "node:test";
import { homedir } from "node:os";
import { join } from "node:path";
import { getGlobalEditorTriggerConfigPath } from "../../../src/extensions/neo-editor/editor-triggers/getGlobalEditorTriggerConfigPath.js";

test("getGlobalEditorTriggerConfigPath uses the Pi agent dir env override", () => {
  const previous = process.env.PI_CODING_AGENT_DIR;
  process.env.PI_CODING_AGENT_DIR = "/tmp/nexus-agent";

  try {
    assert.equal(getGlobalEditorTriggerConfigPath(), "/tmp/nexus-agent/editor-triggers.json");
  } finally {
    if (previous === undefined) {
      delete process.env.PI_CODING_AGENT_DIR;
    } else {
      process.env.PI_CODING_AGENT_DIR = previous;
    }
  }
});

test("getGlobalEditorTriggerConfigPath falls back to the default Pi agent dir", () => {
  const previous = process.env.PI_CODING_AGENT_DIR;
  delete process.env.PI_CODING_AGENT_DIR;

  try {
    assert.equal(getGlobalEditorTriggerConfigPath(), join(homedir(), ".pi", "agent", "editor-triggers.json"));
  } finally {
    if (previous !== undefined) {
      process.env.PI_CODING_AGENT_DIR = previous;
    }
  }
});
