import { getProjectSettingsPath } from "@nexus/runtime/config/getProjectSettingsPath.js";
import { getUserSettingsPath } from "@nexus/runtime/config/getUserSettingsPath.js";
import { readJson } from "./readJson.js";
import { setTransportPreference } from "./state.js";

/**
 * Refreshes the cached transport preference from global and project settings.
 *
 * @param cwd Project cwd.
 */
export async function refreshTransportPreference(cwd: string): Promise<void> {
  const globalSettings = await readJson(getUserSettingsPath());
  const projectSettings = await readJson(getProjectSettingsPath(cwd));
  setTransportPreference(projectSettings?.transport ?? globalSettings?.transport ?? "sse");
}
