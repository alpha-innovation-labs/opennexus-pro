import { join } from "node:path";
import { getAgentDirPath } from "../../../runtime/config/getAgentDirPath.js";
import { getProjectSettingsPath } from "../../../runtime/config/getProjectSettingsPath.js";
import { readJson } from "./readJson.js";
import { setTransportPreference } from "./state.js";

/**
 * Refreshes the cached transport preference from global and project settings.
 *
 * @param cwd Project cwd.
 */
export async function refreshTransportPreference(cwd: string): Promise<void> {
  const globalSettings = await readJson(join(getAgentDirPath(), "settings.json"));
  const projectSettings = await readJson(getProjectSettingsPath(cwd));
  setTransportPreference(projectSettings?.transport ?? globalSettings?.transport ?? "sse");
}
