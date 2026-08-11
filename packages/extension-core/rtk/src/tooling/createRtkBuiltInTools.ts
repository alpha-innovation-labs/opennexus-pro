import type {
	createBashTool,
	createFindTool,
	createGrepTool,
	createLsTool,
	createReadTool,
} from "@earendil-works/pi-coding-agent";
import {
	createEditTool,
	createWriteTool,
} from "@earendil-works/pi-coding-agent";
import type { BuiltInTools } from "@extensions/tron/compact-tool-lines/types";
import { createRtkBashTool } from "./createRtkBashTool";
import { createRtkFindTool } from "./createRtkFindTool";
import { createRtkGrepTool } from "./createRtkGrepTool";
import { createRtkLsTool } from "./createRtkLsTool";
import { createRtkReadTool } from "./createRtkReadTool";

/**
 * Creates the RTK-backed built-in tool map.
 *
 * @param cwd Current working directory.
 * @returns RTK-backed built-in tools.
 */
export function createRtkBuiltInTools(cwd: string): BuiltInTools {
	return {
		read: createRtkReadTool(cwd, false) as ReturnType<typeof createReadTool>,
		bash: createRtkBashTool(cwd, false) as ReturnType<typeof createBashTool>,
		edit: createEditTool(cwd),
		write: createWriteTool(cwd),
		find: createRtkFindTool(cwd, false) as ReturnType<typeof createFindTool>,
		grep: createRtkGrepTool(cwd, false) as ReturnType<typeof createGrepTool>,
		ls: createRtkLsTool(cwd, false) as ReturnType<typeof createLsTool>,
	};
}
