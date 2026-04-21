import { existsSync } from "node:fs";
import { isBundledBinary } from "../../runtime/package/isBundledBinary.js";
import { GATEWAY_RUNNER_COMMAND } from "../shared/constants.js";
import { getSourceEntrypointPath } from "./getSourceEntrypointPath.js";
import { getTsxRuntimeBinaryPath } from "./getTsxRuntimeBinaryPath.js";
import type { GatewayLaunchSpec } from "./types.js";

/**
 * Resolves how the current Nexus install should relaunch itself as a daemon.
 *
 * @returns Launch command and arguments.
 */
export function getGatewayLaunchSpec(): GatewayLaunchSpec {
  const sourceEntrypoint = getSourceEntrypointPath();
  const tsxBinaryPath = getTsxRuntimeBinaryPath();

  if (!isBundledBinary(import.meta.url) && existsSync(sourceEntrypoint) && existsSync(tsxBinaryPath)) {
    return {
      command: tsxBinaryPath,
      args: [sourceEntrypoint, "adapter", GATEWAY_RUNNER_COMMAND],
    };
  }

  return {
    command: process.execPath,
    args: ["adapter", GATEWAY_RUNNER_COMMAND],
  };
}
