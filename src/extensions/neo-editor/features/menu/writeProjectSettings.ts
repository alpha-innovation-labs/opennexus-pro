import { getProjectSettingsPath } from "../../../../runtime/config/getProjectSettingsPath.js";
import { writeJsonFile } from "./writeJsonFile.js";

/**
 * Writes project Nexus settings.
 *
 * @param cwd Project cwd.
 * @param settings Project settings object.
 */
export async function writeProjectSettings(cwd: string, settings: Record<string, unknown>): Promise<void> {
  await writeJsonFile(getProjectSettingsPath(cwd), settings);
}
