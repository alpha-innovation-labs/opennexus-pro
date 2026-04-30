import { getUserSettingsPath } from "@nexus/runtime/config/getUserSettingsPath.js";
import { readJsonFile } from "./readJsonFile.js";

/**
 * Reads global Nexus settings.
 *
 * @returns Global settings object.
 */
export async function readGlobalSettings(): Promise<Record<string, unknown>> {
  return (await readJsonFile<Record<string, unknown>>(getUserSettingsPath())) ?? {};
}
