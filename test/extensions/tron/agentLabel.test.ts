import assert from "node:assert/strict";
import test from "node:test";
import { getAgentLabel } from "../../../packages/extension-core/src/tron/thinking/agentLabel.ts";

test("getAgentLabel defaults to Nexus", () => {
  const original = process.env.NEXUS_AGENT_LABEL;
  delete process.env.NEXUS_AGENT_LABEL;

  try {
    assert.equal(getAgentLabel(), "Nexus");
  } finally {
    if (original === undefined) delete process.env.NEXUS_AGENT_LABEL;
    else process.env.NEXUS_AGENT_LABEL = original;
  }
});

test("getAgentLabel respects the Nexus-specific override", () => {
  const original = process.env.NEXUS_AGENT_LABEL;
  process.env.NEXUS_AGENT_LABEL = "Custom";

  try {
    assert.equal(getAgentLabel(), "Custom");
  } finally {
    if (original === undefined) delete process.env.NEXUS_AGENT_LABEL;
    else process.env.NEXUS_AGENT_LABEL = original;
  }
});
