import { existsSync } from "node:fs";
import { isBundledBinary } from "../../../runtime/package/isBundledBinary.js";
import { getSourceEntrypointPath } from "../../../gateway/process/getSourceEntrypointPath.js";
import { getTsxRuntimeBinaryPath } from "../../../gateway/process/getTsxRuntimeBinaryPath.js";
import type { GatewayLaunchSpec } from "../../../gateway/process/types.js";

/**
 * Resolves how the current Nexus install should launch a child CLI process.
 *
 * @param args CLI arguments for the child run.
 * @returns Launch command and arguments.
 */
export function getNexusCliLaunchSpec(args: string[]): GatewayLaunchSpec {
  const sourceEntrypoint = getSourceEntrypointPath();
  const tsxBinaryPath = getTsxRuntimeBinaryPath();

  if (!isBundledBinary(import.meta.url) && existsSync(sourceEntrypoint) && existsSync(tsxBinaryPath)) {
    return {
      command: tsxBinaryPath,
      args: [sourceEntrypoint, ...args],
    };
  }

  return {
    command: process.execPath,
    args,
  };
}
