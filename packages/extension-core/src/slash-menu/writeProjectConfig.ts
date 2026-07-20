import { getProjectConfigPath } from "@nexus/runtime/config/getProjectConfigPath.js";
import { writeJsonFile } from "./writeJsonFile.js";

/**
 * Writes project Nexus config.
 *
 * @param cwd Project cwd.
 * @param settings Project config object.
 */
export async function writeProjectConfig(cwd: string, settings: Record<string, unknown>): Promise<void> {
  await writeJsonFile(getProjectConfigPath(cwd), settings);
}
