export const startupResumeEnvVar = "NEXUS_STARTUP_RESUME_MODAL";

/**
 * Removes the CLI resume selector flag so Nexus can replace Pi's default resume UI.
 *
 * @param args Raw CLI args.
 * @returns Args with the startup resume flag removed.
 */
export function normalizeResumeStartupArgs(args: string[]): string[] {
  let shouldOpenStartupResumeModal = false;
  const filteredArgs = args.filter((arg) => {
    const isResumeFlag = arg === "--resume" || arg === "-r";
    if (isResumeFlag) shouldOpenStartupResumeModal = true;
    return !isResumeFlag;
  });

  if (shouldOpenStartupResumeModal) {
    process.env[startupResumeEnvVar] = "1";
  }

  return filteredArgs;
}

/**
 * Returns whether startup should prime the Nexus-owned resume modal.
 *
 * @param env Environment values.
 * @returns True when startup should open the custom resume modal.
 */
export function shouldPrimeStartupResumeModal(env: NodeJS.ProcessEnv = process.env): boolean {
  return env[startupResumeEnvVar] === "1";
}
