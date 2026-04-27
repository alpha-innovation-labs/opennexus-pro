import { fileURLToPath } from "node:url";

/**
 * Resolves the local tsx executable used in source mode.
 *
 * @returns Absolute tsx binary path.
 */
export function getTsxRuntimeBinaryPath(): string {
  return fileURLToPath(new URL("../../../../node_modules/.bin/tsx", import.meta.url));
}
