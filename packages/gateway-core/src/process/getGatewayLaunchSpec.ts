import { getCurrentNexusLaunchSpec } from "@nexus/runtime/cli/getCurrentNexusLaunchSpec.js";
import { GATEWAY_RUNNER_COMMAND } from "../shared/constants.js";
import type { GatewayLaunchSpec } from "./types.js";

/**
 * Resolves how the current Nexus install should relaunch itself as a daemon.
 *
 * @returns Launch command and arguments.
 */
export function getGatewayLaunchSpec(): GatewayLaunchSpec {
  return getCurrentNexusLaunchSpec(["gateway", GATEWAY_RUNNER_COMMAND]);
}
