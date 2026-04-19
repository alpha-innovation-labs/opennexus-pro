import {
	createBashTool,
	createEditTool,
	createFindTool,
	createGrepTool,
	createLsTool,
	createReadTool,
	createWriteTool,
} from "@mariozechner/pi-coding-agent";
import type { BuiltInTools } from "./types.ts";

/**
 * Creates compact-rendered built-in tool instances for one cwd.
 *
 * @param cwd Working directory.
 * @returns Built-in tool implementations.
 */
export function createBuiltInTools(cwd: string): BuiltInTools {
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
