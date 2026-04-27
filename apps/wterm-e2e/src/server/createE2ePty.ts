import type { E2ePty } from "../pty/types.js";
import { createPythonPtyBridge } from "../pty/createPythonPtyBridge.js";
import { getE2eCommand } from "./getE2eCommand.js";
import { getE2ePtyOptions } from "./getE2ePtyOptions.js";
import { getShellPath } from "./getShellPath.js";

/**
 * Starts the PTY that runs `just dev` for the browser e2e.
 */
export function createE2ePty(): E2ePty {
  const options = getE2ePtyOptions();

  const shellPath = getShellPath();

  return createPythonPtyBridge({
    shell: shellPath,
    command: getE2eCommand(shellPath),
    cwd: options.cwd,
    cols: options.cols,
    rows: options.rows,
  });
}
