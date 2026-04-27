import { resolve } from "node:path";

/**
 * Resolves the local RPC child entrypoint for Nexus subagents.
 *
 * @returns Absolute path to the local JS bootstrap file.
 */
export function createNexusRpcEntryPath(): string {
  return resolve(process.cwd(), "packages/extensions/src/sub-agents/rpc-entry/nexus-rpc-entry.js");
}
