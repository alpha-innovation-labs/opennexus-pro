import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";

/**
 * Checks whether the RTK binary is available in PATH.
 *
 * @param pi Pi extension API.
 * @param cwd Current working directory.
 * @param signal Optional abort signal.
 * @returns True when RTK can be executed.
 */
export async function hasRtkBinary(pi: ExtensionAPI, cwd: string, signal?: AbortSignal): Promise<boolean> {
  try {
    const result = await pi.exec("rtk", ["--version"], { cwd, signal });
    return result.code === 0;
  } catch {
    return false;
  }
}
