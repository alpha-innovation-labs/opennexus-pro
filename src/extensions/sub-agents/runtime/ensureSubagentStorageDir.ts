import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { getAgentDirPath } from "../../../runtime/config/getAgentDirPath.js";

/**
 * Ensures the subagent storage directory exists.
 *
 * @returns Absolute storage directory path.
 */
export function ensureSubagentStorageDir(): string {
  const dirPath = join(getAgentDirPath(), "subagents");
  mkdirSync(dirPath, { recursive: true });
  return dirPath;
}
