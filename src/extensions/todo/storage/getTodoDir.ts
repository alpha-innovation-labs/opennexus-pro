import { getAgentDir } from "@mariozechner/pi-coding-agent";
import { resolve } from "node:path";

/**
 * Resolves the todo storage directory.
 *
 * @returns Absolute todo directory path.
 */
export function getTodoDir(): string {
	return resolve(getAgentDir(), "todo");
}
