import { getCurrentNexusLaunchSpec } from "../../../runtime/cli/getCurrentNexusLaunchSpec.js";
import type { GatewayLaunchSpec } from "../../../gateway/process/types.js";

/**
 * Resolves how the current Nexus install should launch a child CLI process.
 *
 * @param args CLI arguments for the child run.
 * @returns Launch command and arguments.
 */
export function getNexusCliLaunchSpec(args: string[]): GatewayLaunchSpec {
  return getCurrentNexusLaunchSpec(args);
}
