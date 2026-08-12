import { getProjectConfigPath } from "@nexus/runtime";
import { readJsonFile } from "./readJsonFile";

/**
 * Reads project Nexus config.
 *
 * @param cwd Project cwd.
 * @returns Project config object.
 */
export async function readProjectConfig(
	cwd: string,
): Promise<Record<string, unknown>> {
	return (
		(await readJsonFile<Record<string, unknown>>(getProjectConfigPath(cwd))) ??
		{}
	);
}
