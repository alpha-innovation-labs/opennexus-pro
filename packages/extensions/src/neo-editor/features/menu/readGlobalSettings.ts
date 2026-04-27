import { getAgentDirPath } from "@nexus/runtime/config/getAgentDirPath.js";
import { join } from "node:path";
import { readJsonFile } from "./readJsonFile.js";

/**
 * Reads global Nexus settings.
 *
 * @returns Global settings object.
 */
export async function readGlobalSettings(): Promise<Record<string, unknown>> {
  return (await readJsonFile<Record<string, unknown>>(join(getAgentDirPath(), "settings.json"))) ?? {};
}
