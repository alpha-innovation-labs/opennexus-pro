import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";

export type RtkExecResult = {
  code: number;
  stdout: string;
  stderr: string;
};

export type RtkRuntime = {
  /**
   * Executes an RTK subcommand through the current Nexus process.
   *
   * @param command RTK subcommand name.
   * @param args RTK subcommand arguments.
   * @param options Execution options.
   * @returns Process result.
   */
  exec(command: string, args: string[], options?: { cwd?: string; signal?: AbortSignal }): Promise<RtkExecResult>;
};

/**
 * Creates the RTK process wrapper used by the RTK extension.
 *
 * @param pi Pi extension API.
 * @returns RTK runtime wrapper.
 */
export function createRtkRuntime(pi: ExtensionAPI): RtkRuntime {
  return {
    async exec(command: string, args: string[], options?: { cwd?: string; signal?: AbortSignal }) {
      return (await pi.exec("rtk", [command, ...args], {
        cwd: options?.cwd,
        signal: options?.signal,
      })) as RtkExecResult;
    },
  };
}
