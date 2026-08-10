import { getProjectConfigPath } from "@nexus/runtime/config/getProjectConfigPath.js";
import { getUserConfigPath } from "@nexus/runtime/config/getUserConfigPath.js";
import { readJson } from "./readJson.js";
import { setTransportPreference } from "./state.js";

/**
 * Refreshes the cached transport preference from global and project settings.
 *
 * @param cwd Project cwd.
 */
export async function refreshTransportPreference(cwd: string): Promise<void> {
  const globalSettings = await readJson(getUserConfigPath());
  const projectConfig = await readJson(getProjectConfigPath(cwd));
  setTransportPreference(projectConfig?.transport ?? globalSettings?.transport ?? "sse");
}
