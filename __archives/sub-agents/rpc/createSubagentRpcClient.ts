import type { ExtensionContext, RpcClient } from "@earendil-works/pi-coding-agent";
import { RpcClient as PiRpcClient } from "@earendil-works/pi-coding-agent";
import { createNexusRpcEntryPath } from "../rpc-entry/createNexusRpcEntryPath.js";

/**
 * Creates one Nexus-local RPC client for a child subagent process.
 *
 * @param ctx Extension runtime context.
 * @param modelOverride Optional provider/model string.
 * @returns Configured RPC client.
 */
export function createSubagentRpcClient(ctx: ExtensionContext, modelOverride?: string): RpcClient {
  const provider = modelOverride?.includes("/") ? modelOverride.split("/")[0] : ctx.model?.provider;
  const model = modelOverride?.includes("/") ? modelOverride.split("/").slice(1).join("/") : ctx.model?.id;
  return new PiRpcClient({
    cliPath: createNexusRpcEntryPath(),
    cwd: ctx.cwd,
    provider,
    model,
    args: ["--no-extensions"],
  });
}
