import { parseReleaseTarget } from "./parseReleaseTarget.mjs";

/**
 * Returns the active release target options from the environment.
 *
 * @returns {{ platform?: NodeJS.Platform, arch?: string, libc?: "gnu" | "musl", bunTarget?: string, npmOs?: string[], npmCpu?: string[] }} Active release target options.
 */
export function getReleaseTargetOptions() {
  return parseReleaseTarget(process.env.NEXUS_RELEASE_TARGET);
}
