import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { isBundledBinary } from "../package/isBundledBinary";
import { getSourceEntrypointPath } from "./getSourceEntrypointPath";
import { getTsxRuntimeBinaryPath } from "./getTsxRuntimeBinaryPath";
import type { NexusLaunchSpec } from "./types";

/**
 * Resolves how the current Nexus process should relaunch itself.
 *
 * @param args CLI arguments for the child run.
 * @returns Launch command and arguments for the current Nexus install.
 */
export function getCurrentNexusLaunchSpec(args: string[]): NexusLaunchSpec {
  const sourceEntrypoint = getSourceEntrypointPath();
  const tsxBinaryPath = getTsxRuntimeBinaryPath();
  const currentEntrypoint = process.argv[1];
  const normalizedCurrentEntrypoint = currentEntrypoint ? resolve(currentEntrypoint) : undefined;
  const bundledBinary = isBundledBinary(import.meta.url);
  const isRunningSourceEntrypoint = normalizedCurrentEntrypoint === sourceEntrypoint;

  if (!bundledBinary && isRunningSourceEntrypoint && existsSync(sourceEntrypoint) && existsSync(tsxBinaryPath)) {
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
