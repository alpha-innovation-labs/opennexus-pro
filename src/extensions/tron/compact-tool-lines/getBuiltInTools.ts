import { createBuiltInTools } from "./createBuiltInTools.ts";
import { toolCache } from "./toolCache.ts";
import type { BuiltInTools } from "./types.ts";

/**
 * Returns cached built-in tool instances for one cwd.
 *
 * @param cwd Working directory.
 * @returns Cached built-in tools.
 */
export function getBuiltInTools(cwd: string): BuiltInTools {
	let tools = toolCache.get(cwd);
	if (!tools) {
		tools = createBuiltInTools(cwd);
		toolCache.set(cwd, tools);
	}
	return tools;
}
