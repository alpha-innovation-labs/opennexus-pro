import { getRtkRuntimeForCwd } from "../../rtk/runtime/runtimeStore.js";
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
	const runtimeKey = getRtkRuntimeForCwd(cwd) ? "rtk" : "base";
	const cacheKey = `${cwd}::${runtimeKey}`;
	let tools = toolCache.get(cacheKey);
	if (!tools) {
		tools = createBuiltInTools(cwd);
		toolCache.set(cacheKey, tools);
	}
	return tools;
}
