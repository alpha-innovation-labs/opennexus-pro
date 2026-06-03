import { getAgentDirPath } from "@nexus/runtime/config/getAgentDirPath.js";
import { resolve } from "node:path";

/**
 * Resolves the Nexus steering queue storage directory.
 *
 * @returns Absolute steering queue directory path.
 */
export function getSteerQueueDir(): string {
  return resolve(getAgentDirPath(), "steer-queue");
}
