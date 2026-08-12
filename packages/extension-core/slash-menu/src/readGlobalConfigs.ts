import { getUserConfigPath } from "@nexus/runtime";
import { readJsonFile } from "./readJsonFile";

/**
 * Reads global Nexus config.
 *
 * @returns Global config object.
 */
export async function readGlobalConfigs(): Promise<Record<string, unknown>> {
	return (
		(await readJsonFile<Record<string, unknown>>(getUserConfigPath())) ?? {}
	);
}
