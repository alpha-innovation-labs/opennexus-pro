import { parseResumeCliRequest } from "./resume/parseResumeCliRequest.js";
import { rewriteDirectResumeArgs } from "./resume/rewriteDirectResumeArgs.js";
import { isResumeSelectorFlag } from "./resume/isResumeSelectorFlag.js";

export const startupResumeEnvVar = "NEXUS_STARTUP_RESUME_MODAL";

/**
 * Normalizes CLI resume arguments for Nexus-owned picker launches and direct session targets.
 *
 * @param args Raw CLI args.
 * @returns Args normalized for Nexus startup resume behavior.
 */
export function normalizeResumeStartupArgs(args: string[]): string[] {
  const request = parseResumeCliRequest(args);

  if (request.mode === "direct") {
    return rewriteDirectResumeArgs(args, request);
  }

  if (request.mode === "picker") {
    process.env[startupResumeEnvVar] = "1";
    return args.filter((arg) => !isResumeSelectorFlag(arg));
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
