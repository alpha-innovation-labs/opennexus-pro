import { homedir } from "node:os";
import { join } from "node:path";

/**
 * Resolves the default Nexus memory root.
 *
 * @returns Default global memory directory.
 */
export function getDefaultMemoryRoot(): string {
	return join(homedir(), ".local", "share", "nexus", "memory");
}
