import { readFile } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";

export type NexusMemorySettings = { memory?: { root?: string } };

/**
 * Reads Nexus settings from the user config directory.
 *
 * @returns Parsed settings or an empty settings object.
 */
export async function readNexusMemorySettings(): Promise<NexusMemorySettings> {
	try {
		return JSON.parse(await readFile(join(homedir(), ".config", "nexus", "settings.json"), "utf8")) as NexusMemorySettings;
	} catch {
		return {};
	}
}
