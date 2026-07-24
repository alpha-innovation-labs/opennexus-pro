import { join } from "node:path";
import { getAgentDir } from "@earendil-works/pi-coding-agent/dist/config.js";

/**
 * Resolves the extracted package-asset directory for the installed binary.
 *
 * @returns Absolute extracted package directory.
 */
export function getEmbeddedPackageDirPath(): string {
  return join(getAgentDir(), ".package");
}
