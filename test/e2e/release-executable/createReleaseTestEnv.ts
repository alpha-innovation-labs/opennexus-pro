import { delimiter } from "node:path";

/**
 * Builds the environment for isolated release e2e runs.
 *
 * @param homeDir Temporary HOME path.
 * @returns Environment variables for child commands.
 */
export function createReleaseTestEnv(homeDir: string): NodeJS.ProcessEnv {
  return {
    ...process.env,
    HOME: homeDir,
    PATH: process.env.PATH ?? ["/opt/homebrew/bin", "/usr/local/bin", "/usr/bin", "/bin"].join(delimiter),
  };
}
