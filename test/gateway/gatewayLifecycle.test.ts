import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { getGatewayStatus } from "../../packages/gateway-core/src/commands/getGatewayStatus.js";
import { startGateway } from "../../packages/gateway-core/src/commands/startGateway.js";
import { stopGateway } from "../../packages/gateway-core/src/commands/stopGateway.js";

/**
 * Waits for the gateway to reach the requested running state.
 *
 * @param expectedRunning Desired running value.
 * @returns Matching gateway status.
 */
async function waitForGatewayRunningState(expectedRunning: boolean) {
  const deadline = Date.now() + 8000;

  for (;;) {
    const status = await getGatewayStatus();
    if (status.running === expectedRunning) {
      return status;
    }
    if (Date.now() > deadline) {
      throw new Error(`Gateway did not reach running=${String(expectedRunning)} in time`);
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
}

test("startGateway launches the daemon in the background and stopGateway stops it", async () => {
  const agentDir = await mkdtemp(join(tmpdir(), "nexus-gateway-"));
  const previousAgentDir = process.env.NEXUS_CODING_AGENT_DIR;
  process.env.NEXUS_CODING_AGENT_DIR = agentDir;

  try {
    const startResult = await startGateway();
    assert.equal(startResult.started, true);
    assert.equal(startResult.status.running, true);
    assert.ok(startResult.status.pid);

    const runningStatus = await waitForGatewayRunningState(true);
    assert.equal(runningStatus.running, true);
    assert.ok(runningStatus.pid);

    const stopResult = await stopGateway();
    assert.equal(stopResult.stopped, true);

    const stoppedStatus = await waitForGatewayRunningState(false);
    assert.equal(stoppedStatus.running, false);
  } finally {
    await stopGateway();
    if (previousAgentDir === undefined) {
      delete process.env.NEXUS_CODING_AGENT_DIR;
    } else {
      process.env.NEXUS_CODING_AGENT_DIR = previousAgentDir;
    }
    await rm(agentDir, { recursive: true, force: true });
  }
});
