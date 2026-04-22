import { join } from "node:path";
import { getAgentDirPath } from "../../config/getAgentDirPath.js";

/**
 * Resolves the extracted package-asset directory for the installed binary.
 *
 * @returns Absolute extracted package directory.
 */
export function getEmbeddedPackageDirPath(): string {
  return join(getAgentDirPath(), ".package");
}
