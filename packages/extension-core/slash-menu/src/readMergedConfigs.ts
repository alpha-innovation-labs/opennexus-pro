import { readBundledDefaultSettings } from "@nexus/runtime/config/readBundledDefaultSettings.js";
import { mergeSettings } from "@nexus/runtime/config/mergeSettings.js";
import { readGlobalConfigs } from "./readGlobalConfigs.js";
import { readProjectConfig } from "./readProjectConfig.js";

/**
 * Reads bundled, global, and project config with normal override order.
 *
 * @param cwd Project cwd.
 * @returns Merged config object.
 */
export async function readMergedConfigs(cwd: string): Promise<Record<string, unknown>> {
  const defaults = readBundledDefaultSettings();
  const globalConfig = await readGlobalConfigs();
  const projectConfig = await readProjectConfig(cwd);
  return mergeSettings(mergeSettings(defaults, globalConfig), projectConfig);
}
