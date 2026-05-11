import test from "node:test";
import assert from "node:assert/strict";
import { resolve } from "node:path";
import { createNexusRpcEntryPath } from "../../../../packages/extension-core/src/sub-agents/rpc-entry/createNexusRpcEntryPath.js";

/**
 * Verifies the local Nexus RPC bootstrap path.
 */
test("createNexusRpcEntryPath resolves the local Nexus RPC bootstrap", () => {
  assert.equal(
    createNexusRpcEntryPath(),
    resolve(process.cwd(), "packages/extension-core/src/sub-agents/rpc-entry/nexus-rpc-entry.js"),
  );
});
