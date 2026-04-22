import { readBundledDefaultSettings } from "../../../runtime/config/default-settings/readBundledDefaultSettings.js";
import { mergeSettings } from "../../../runtime/config/mergeSettings.js";
import { readGlobalSettings } from "./readGlobalSettings.js";
import { readProjectSettings } from "./readProjectSettings.js";

/**
 * Reads bundled, global, and project settings with normal override order.
 *
 * @param cwd Project cwd.
 * @returns Merged settings object.
 */
export async function readMergedSettings(cwd: string): Promise<Record<string, unknown>> {
  const defaults = readBundledDefaultSettings();
  const globalSettings = await readGlobalSettings();
  const projectSettings = await readProjectSettings(cwd);
  return mergeSettings(mergeSettings(defaults, globalSettings), projectSettings);
}
