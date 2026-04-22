import { delimiter, join } from "node:path";

/**
 * Builds the environment for isolated release e2e runs.
 *
 * @param homeDir Temporary HOME path.
 * @returns Environment variables for child commands.
 */
export function createReleaseTestEnv(homeDir: string): NodeJS.ProcessEnv {
  const prefixDir = join(homeDir, ".local");
  const pathParts = [join(prefixDir, "bin"), process.env.PATH ?? ["/opt/homebrew/bin", "/usr/local/bin", "/usr/bin", "/bin"].join(delimiter)];

  return {
    ...process.env,
    HOME: homeDir,
    PATH: pathParts.join(delimiter),
    npm_config_prefix: prefixDir,
  };
}
