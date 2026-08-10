import { getProjectConfigPath } from "@nexus/runtime/config/getProjectConfigPath.js";
import { readJsonFile } from "./readJsonFile.js";

/**
 * Reads project Nexus config.
 *
 * @param cwd Project cwd.
 * @returns Project config object.
 */
export async function readProjectConfig(cwd: string): Promise<Record<string, unknown>> {
  return (await readJsonFile<Record<string, unknown>>(getProjectConfigPath(cwd))) ?? {};
}
