import { getProjectConfigPath } from "@nexus/runtime/config/getProjectConfigPath";
import { getUserConfigPath } from "@nexus/runtime/config/getUserConfigPath";
import { readJson } from "./readJson";
import { setTransportPreference } from "./state";

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
