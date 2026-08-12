import { getRtkRuntimeForCwd } from "@extensions/rtk";
import { createBuiltInTools } from "./createBuiltInTools";
import { toolCache } from "./toolCache";
import type { BuiltInTools } from "./types";

/**
 * Returns cached built-in tool instances for one cwd.
 *
 * @param cwd Working directory.
 * @returns Cached built-in tools.
 */
export function getBuiltInTools(cwd: string): BuiltInTools {
	const runtimeKey = getRtkRuntimeForCwd(cwd) ? "rtk" : "base";
	const cacheKey = `${cwd}::${runtimeKey}`;
	let tools = toolCache.get(cacheKey);
	if (!tools) {
		tools = createBuiltInTools(cwd);
		toolCache.set(cacheKey, tools);
	}
	return tools;
}
