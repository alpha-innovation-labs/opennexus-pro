import { homedir } from "node:os";
import { expandHomePath } from "./expandHomePath.js";

/**
 * Reads the package directory override from the environment.
 *
 * @param env Environment variables to inspect.
 * @param homeDir Home directory used for tilde expansion.
 * @returns Expanded package directory override when configured.
 */
export function getConfiguredPackageDir(
  env: NodeJS.ProcessEnv = process.env,
  homeDir: string = homedir(),
): string | null {
  const configuredPath = env.PI_PACKAGE_DIR;
  if (!configuredPath) return null;
  return expandHomePath(configuredPath, homeDir);
}
