import { homedir } from "node:os";
import { join } from "node:path";
import { readJsonFile } from "./readJsonFile.js";

/**
 * Reads Pi auth storage from disk.
 *
 * @returns Parsed Pi auth payload.
 */
export function readPiAuth(): Record<string, unknown> | undefined {
	return readJsonFile(join(homedir(), ".pi", "agent", "auth.json"));
}
