import { getUserConfigPath } from "@nexus/runtime/config/getUserConfigPath.js";
import { readJsonFile } from "./readJsonFile.js";

/**
 * Reads global Nexus config.
 *
 * @returns Global config object.
 */
export async function readGlobalConfigs(): Promise<Record<string, unknown>> {
  return (await readJsonFile<Record<string, unknown>>(getUserConfigPath())) ?? {};
}
