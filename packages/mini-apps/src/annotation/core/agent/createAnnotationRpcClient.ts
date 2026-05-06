import { RpcClient } from "@mariozechner/pi-coding-agent";
import { getNexusCliPath } from "./getNexusCliPath.js";

/**
 * Creates a real Nexus RPC client in the annotated project's directory.
 *
 * @param workspaceDir Project directory where source edits must be applied.
 * @returns Configured Nexus RPC client.
 */
export function createAnnotationRpcClient(workspaceDir: string): RpcClient {
  return new RpcClient({
    cliPath: getNexusCliPath(),
    cwd: workspaceDir,
    args: [],
  });
}
