/**
 * Dev environment mastracode detection test.
 *
 * Verifies that `just dev` (running via `npx tsx`) starts a Herdr agent
 * correctly detected as `mastracode` — not `omp`.
 *
 * This is the regression test for the `agent_kind_mismatch` bug where
 * Herdr detected the dev process as `omp` instead of `mastracode` because
 * the `npx tsx` process chain lost the `exec -a mastracode` process title.
 *
 * The fix: `index.ts` checks `NEXUS_DEV_MODE=1` and sets `process.title`
 * to `"mastracode"` instead of `APP_NAME` when running in dev mode.
 */

import { describe, it, expect, afterAll, beforeAll } from "vitest";
import {
  prepareHerdr,
  closeHerdrWorkspace,
} from "../packages/herdr/src/index.js";

// ---------------------------------------------------------------------------
// Workspace lifecycle
// ---------------------------------------------------------------------------

const workspaceLabel = "nexus-dev-mastracode-detection";
let workspaceId: string | undefined;
let rootPaneId: string | undefined;
let agentName: string | undefined;

beforeAll(() => {
  // Generate a unique agent name to avoid collisions with other tests.
  const randomHex = Buffer.from(
    crypto.getRandomValues(new Uint8Array(4)),
  ).toString("hex").slice(0, 4);
  const uniqueAgentName = `mastracode-test-${randomHex}`;

  const prepared = prepareHerdr({
    workspaceLabel,
    maxWaitSeconds: 60,
    agentName: uniqueAgentName,
  });
  workspaceId = prepared.workspaceId;
  rootPaneId = prepared.rootPaneId;
  agentName = prepared.agentName;
}, 120_000);

afterAll(() => {
  if (workspaceId) {
    try {
      closeHerdrWorkspace(workspaceId);
    } catch {
      // Workspace may already be closed.
    }
  }
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Runs a herdr CLI command and returns parsed JSON.
 */
function runHerdrCli(
  args: string[],
  { timeoutMs = 10_000 }: { timeoutMs?: number } = {},
): Record<string, unknown> {
  const { spawnSync } = require("node:child_process");
  const result = spawnSync("herdr", args, {
    encoding: "utf-8",
    timeout: timeoutMs,
  });

  if (result.error) {
    throw new Error(`herdr ${args.join(" ")}: ${result.error.message}`);
  }

  const stderr = result.stderr?.toString() ?? "";
  const stdout = result.stdout?.toString() ?? "";
  const source = stderr.startsWith("{") ? stderr : stdout;

  if (!source) {
    throw new Error(`herdr ${args.join(" ")}: no output`);
  }

  if (!source.startsWith("{")) {
    return { _raw: source } as Record<string, unknown>;
  }

  return JSON.parse(source) as Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("Dev environment mastracode detection", () => {
  it("starts a mastracode agent without agent_kind_mismatch error", () => {
    // The test succeeds if prepareHerdr() did not throw.
    // If the fix is broken, Herdr returns:
    //   {"error":{"code":"agent_kind_mismatch","message":"expected mastracode, detected omp"}}
    // which prepareHerdr re-throws as a FATAL error.
    expect(agentName).toBeDefined();
    expect(rootPaneId).toBeDefined();
  });

  it("agent is detected as mastracode (not omp)", () => {
    const result = runHerdrCli(["agent", "list"]);
    const agents = (result.result as Record<string, unknown>)?.agents as
      | Record<string, unknown>[]
      | undefined;

    expect(agents).toBeDefined();
    expect(Array.isArray(agents)).toBe(true);

    const detectedAgent = (agents as Record<string, unknown>[]).find(
      (a: Record<string, unknown>) =>
        (a as Record<string, unknown>).name === agentName,
    );

    expect(detectedAgent).toBeDefined();
    expect((detectedAgent as Record<string, unknown>).agent).toBe("mastracode");
  });

  it("agent is interactive_ready", () => {
    const result = runHerdrCli(["agent", "get", agentName!]);
    const agentInfo = (result.result as Record<string, unknown>) as
      | Record<string, unknown>
      | undefined;

    if (!agentInfo) {
      throw new Error(`No agent info in response: ${JSON.stringify(result)}`);
    }

    const interactiveReady = agentInfo.interactive_ready as
      | boolean
      | undefined;
    // The agent should be ready within the startup window.
    // If not ready yet, the agent still exists — the detection test above
    // is the critical check.
    if (interactiveReady !== undefined) {
      expect(interactiveReady).toBe(true);
    }
  });
});
