import type { DemoPty } from "../pty/types.js";
import { createPythonPtyBridge } from "../pty/createPythonPtyBridge.js";
import { getDemoCommand } from "./getDemoCommand.js";
import { getDemoPtyOptions } from "./getDemoPtyOptions.js";
import { getShellPath } from "./getShellPath.js";

/**
 * Starts the PTY that runs `just dev` for the browser demo.
 */
export function createDemoPty(): DemoPty {
  const options = getDemoPtyOptions();

  const shellPath = getShellPath();

  return createPythonPtyBridge({
    shell: shellPath,
    command: getDemoCommand(shellPath),
    cwd: options.cwd,
    cols: options.cols,
    rows: options.rows,
  });
}
