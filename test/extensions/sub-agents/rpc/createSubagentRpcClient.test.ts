import test from "node:test";
import assert from "node:assert/strict";
import { createSubagentRpcClient } from "../../../../src/extensions/sub-agents/rpc/createSubagentRpcClient.js";

/**
 * Verifies child subagents persist sessions in the main agent dir.
 */
test("createSubagentRpcClient uses the shared agent directory and persisted sessions", () => {
  const client: any = createSubagentRpcClient({ cwd: process.cwd(), model: undefined } as any);
  assert.equal(Array.isArray(client.options.args), true);
  assert.equal(client.options.args.includes("--no-session"), false);
  assert.equal(client.options.env, undefined);
});
