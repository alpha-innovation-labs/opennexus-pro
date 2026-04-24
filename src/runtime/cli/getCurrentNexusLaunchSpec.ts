import { existsSync } from "node:fs";
import { getSourceEntrypointPath } from "../../gateway/process/getSourceEntrypointPath.js";
import { getTsxRuntimeBinaryPath } from "../../gateway/process/getTsxRuntimeBinaryPath.js";
import { isBundledBinary } from "../package/isBundledBinary.js";
import type { GatewayLaunchSpec } from "../../gateway/process/types.js";

/**
 * Resolves how the current Nexus process should relaunch itself.
 *
 * @param args CLI arguments for the child run.
 * @returns Launch command and arguments for the current Nexus install.
 */
export function getCurrentNexusLaunchSpec(args: string[]): GatewayLaunchSpec {
  const sourceEntrypoint = getSourceEntrypointPath();
  const tsxBinaryPath = getTsxRuntimeBinaryPath();
  const currentEntrypoint = process.argv[1];
  const bundledBinary = isBundledBinary(import.meta.url);
  const isRunningSourceEntrypoint = currentEntrypoint === sourceEntrypoint;
  const isRunningProjectSource = Boolean(currentEntrypoint?.startsWith(process.cwd()));

  if (!bundledBinary && (isRunningSourceEntrypoint || isRunningProjectSource) && existsSync(sourceEntrypoint) && existsSync(tsxBinaryPath)) {
    return {
      command: tsxBinaryPath,
      args: [sourceEntrypoint, ...args],
    };
  }

  if (bundledBinary) {
    return {
      command: process.execPath,
      args,
    };
  }

  if (currentEntrypoint) {
    return {
      command: process.execPath,
      args: [currentEntrypoint, ...args],
    };
  }

  return {
    command: process.execPath,
    args,
  };
}
