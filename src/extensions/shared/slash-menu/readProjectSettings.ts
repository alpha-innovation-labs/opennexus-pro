import { getProjectSettingsPath } from "../../../runtime/config/getProjectSettingsPath.js";
import { readJsonFile } from "./readJsonFile.js";

/**
 * Reads project Nexus settings.
 *
 * @param cwd Project cwd.
 * @returns Project settings object.
 */
export async function readProjectSettings(cwd: string): Promise<Record<string, unknown>> {
  return (await readJsonFile<Record<string, unknown>>(getProjectSettingsPath(cwd))) ?? {};
}
