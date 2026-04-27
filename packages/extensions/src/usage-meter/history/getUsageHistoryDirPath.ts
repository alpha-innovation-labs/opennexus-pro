import { join } from "node:path";
import { getNexusAgentDirPath } from "../shared/getNexusAgentDirPath.js";

/**
 * Returns the XDG-backed usage history directory.
 *
 * @returns Absolute usage history directory path.
 */
export function getUsageHistoryDirPath(): string {
  return join(getNexusAgentDirPath(), "usage-history");
}
