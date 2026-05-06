import { fileURLToPath } from "node:url";

/**
 * Resolves the JavaScript wrapper used by RpcClient to run real Nexus.
 *
 * @returns Absolute wrapper path.
 */
export function getNexusCliPath(): string {
  return fileURLToPath(new URL("./nexusRpcCli.mjs", import.meta.url));
}
