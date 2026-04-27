import { getRtkDefaultInstallPath } from "./getRtkDefaultInstallPath.js";

/**
 * Creates the RTK command candidates Nexus can execute.
 *
 * @returns RTK command candidates in priority order.
 */
export function createRtkCommandCandidates(): string[] {
  return ["rtk", getRtkDefaultInstallPath()];
}
