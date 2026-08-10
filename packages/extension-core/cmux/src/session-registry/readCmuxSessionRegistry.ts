import { readFile } from "node:fs/promises";
import { createEmptyCmuxSessionRegistry } from "./createEmptyCmuxSessionRegistry";
import type { CmuxSessionRegistry } from "./types";

/**
 * Reads the cmux session registry from disk.
 *
 * @param registryPath Registry file path.
 * @returns Parsed registry or an empty registry when missing/invalid.
 */
export async function readCmuxSessionRegistry(registryPath: string): Promise<CmuxSessionRegistry> {
	try {
		const value = JSON.parse(await readFile(registryPath, "utf8")) as Partial<CmuxSessionRegistry>;
		if (!Array.isArray(value.entries)) return createEmptyCmuxSessionRegistry();
		return { version: 1, entries: value.entries.filter((entry) => typeof entry?.surfaceId === "string" && typeof entry.sessionId === "string") };
	} catch {
		return createEmptyCmuxSessionRegistry();
	}
}
