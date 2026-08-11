import { join } from "node:path";
import { getNexusAgentDirPath } from "../../config/getNexusAgentDirPath";

/**
 * Resolves the extracted package-asset directory for the installed binary.
 *
 * @returns Absolute extracted package directory.
 */
export function getEmbeddedPackageDirPath(): string {
	return join(getNexusAgentDirPath(), ".package");
}
