export const startupUsageEnvVar = "NEXUS_STARTUP_USAGE_MODAL";

/**
 * Removes the Nexus-owned usage startup flag and stores its intent in env.
 *
 * @param args Raw CLI args.
 * @returns Args without the usage startup flag.
 */
export function normalizeUsageStartupArgs(args: string[]): string[] {
  if (!args.includes("--usage")) return [...args];
  process.env[startupUsageEnvVar] = "1";
  return args.filter((arg) => arg !== "--usage");
}

/**
 * Returns whether startup should open the usage history modal.
 *
 * @param env Environment values.
 * @returns True when usage modal should open on startup.
 */
export function shouldPrimeStartupUsageModal(env: NodeJS.ProcessEnv = process.env): boolean {
  return env[startupUsageEnvVar] === "1";
}
