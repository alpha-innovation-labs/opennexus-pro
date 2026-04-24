import { createEditTool, createWriteTool } from "@mariozechner/pi-coding-agent";
import type { BuiltInTools } from "../../tron/compact-tool-lines/types.js";
import { createRtkBashTool } from "./createRtkBashTool.js";
import { createRtkFindTool } from "./createRtkFindTool.js";
import { createRtkGrepTool } from "./createRtkGrepTool.js";
import { createRtkLsTool } from "./createRtkLsTool.js";
import { createRtkReadTool } from "./createRtkReadTool.js";

/**
 * Creates the RTK-backed built-in tool map.
 *
 * @param cwd Current working directory.
 * @returns RTK-backed built-in tools.
 */
export function createRtkBuiltInTools(cwd: string): BuiltInTools {
  return {
    read: createRtkReadTool(),
    bash: createRtkBashTool(),
    edit: createEditTool(cwd),
    write: createWriteTool(cwd),
    find: createRtkFindTool(),
    grep: createRtkGrepTool(),
    ls: createRtkLsTool(),
  };
}
