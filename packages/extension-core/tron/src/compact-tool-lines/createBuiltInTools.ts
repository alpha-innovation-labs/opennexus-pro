import {
	createBashTool,
	createEditTool,
	createFindTool,
	createGrepTool,
	createLsTool,
	createReadTool,
	createWriteTool,
} from "@earendil-works/pi-coding-agent";
import { getRtkRuntimeForCwd } from '@extensions/rtk/runtime/runtimeStore.ts';
import { createRtkBuiltInTools } from '@extensions/rtk/tooling/createRtkBuiltInTools.ts';
import type { BuiltInTools } from "./types.ts";

/**
 * Creates compact-rendered built-in tool instances for one cwd.
 *
 * @param cwd Working directory.
 * @returns Built-in tool implementations.
 */
export function createBuiltInTools(cwd: string): BuiltInTools {
	if (getRtkRuntimeForCwd(cwd)) {
		return createRtkBuiltInTools(cwd);
	}

	return {
		read: createReadTool(cwd),
		bash: createBashTool(cwd),
		edit: createEditTool(cwd),
		write: createWriteTool(cwd),
		find: createFindTool(cwd),
		grep: createGrepTool(cwd),
		ls: createLsTool(cwd),
	};
}
