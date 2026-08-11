import { mergeSettings } from "@nexus/runtime/config/mergeSettings";
import { readBundledDefaultSettings } from "@nexus/runtime/config/readBundledDefaultSettings";
import { readGlobalConfigs } from "./readGlobalConfigs";
import { readProjectConfig } from "./readProjectConfig";

/**
 * Reads bundled, global, and project config with normal override order.
 *
 * @param cwd Project cwd.
 * @returns Merged config object.
 */
export async function readMergedConfigs(
	cwd: string,
): Promise<Record<string, unknown>> {
	const defaults = readBundledDefaultSettings();
	const globalConfig = await readGlobalConfigs();
	const projectConfig = await readProjectConfig(cwd);
	return mergeSettings(mergeSettings(defaults, globalConfig), projectConfig);
}
