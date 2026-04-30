import { resolve } from "node:path";
import { getDefaultMemoryRoot } from "./getDefaultMemoryRoot.js";
import { readNexusMemorySettings } from "./readNexusMemorySettings.js";

/**
 * Resolves the configured Nexus memory root.
 *
 * @returns Absolute memory root path.
 */
export async function resolveMemoryRoot(): Promise<string> {
	const settings = await readNexusMemorySettings();
	return resolve(settings.memory?.root ?? getDefaultMemoryRoot());
}
