import { getProjectConfigPath } from "@nexus/runtime";
import { getUserConfigPath } from "@nexus/runtime";
import { readJson } from "./readJson";
import { setTransportPreference } from "./state";

/**
 * Refreshes the cached transport preference from global and project settings.
 *
 * @param cwd Project cwd.
 */
export async function refreshTransportPreference(cwd: string): Promise<void> {
	const globalSettings: unknown = await readJson(
		getUserConfigPath(),
	);
	const projectConfig: unknown = await readJson(
		getProjectConfigPath(cwd),
	);
	const transport =
		(typeof projectConfig === "object" && projectConfig != null
			? (projectConfig as { transport?: string }).transport
			: undefined) ??
		(typeof globalSettings === "object" && globalSettings != null
			? (globalSettings as { transport?: string }).transport
			: undefined) ??
		"sse";
	setTransportPreference(transport);
}
