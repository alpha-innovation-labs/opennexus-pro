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

  const agentDir = join(prefixDir, "share", "nexus", "agent");

  return {
    ...process.env,
    HOME: homeDir,
    PATH: pathParts.join(delimiter),
    npm_config_prefix: prefixDir,
    NEXUS_CODING_AGENT_DIR: agentDir,
    PI_CODING_AGENT_DIR: agentDir,
  };
}
