import { parseResumeCliRequest } from "./resume/parseResumeCliRequest.js";
import { rewriteDirectResumeArgs } from "./resume/rewriteDirectResumeArgs.js";

export const startupResumeEnvVar = "NEXUS_STARTUP_RESUME_MODAL";
export const resumeLaunchEnvVar = "NEXUS_RESUME_LAUNCH";

/**
 * Normalizes CLI resume arguments for direct session targets while preserving picker launches.
 *
 * @param args Raw CLI args.
 * @returns Args normalized for Nexus resume behavior.
 */
export function normalizeResumeStartupArgs(args: string[]): string[] {
  const request = parseResumeCliRequest(args);

  if (request.mode === "direct") {
    process.env[resumeLaunchEnvVar] = "1";
    return rewriteDirectResumeArgs(args, request);
  }

  if (request.mode === "picker") {
    process.env[resumeLaunchEnvVar] = "1";
    return [...args];
  }

  return [...args];
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

/**
 * Returns whether this process was launched from any resume CLI path.
 *
 * @param env Environment values.
 * @returns True when the current launch is resume-related.
 */
export function isResumeLaunch(env: NodeJS.ProcessEnv = process.env): boolean {
  return env[resumeLaunchEnvVar] === "1";
}
