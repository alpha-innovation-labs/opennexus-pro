import { getRtkDefaultInstallPath } from "./getRtkDefaultInstallPath";

/**
 * Creates the RTK command candidates Nexus can execute.
 *
 * @returns RTK command candidates in priority order.
 */
export function createRtkCommandCandidates(): string[] {
  return ["rtk", getRtkDefaultInstallPath()];
}
