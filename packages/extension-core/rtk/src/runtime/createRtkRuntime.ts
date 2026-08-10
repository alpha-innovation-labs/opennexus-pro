import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

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
 * @param command RTK command or absolute path.
 * @returns RTK runtime wrapper.
 */
export function createRtkRuntime(pi: ExtensionAPI, binaryCommand = "rtk"): RtkRuntime {
  return {
    async exec(command: string, args: string[], options?: { cwd?: string; signal?: AbortSignal }) {
      return (await pi.exec(binaryCommand, [command, ...args], {
        cwd: options?.cwd,
        signal: options?.signal,
      })) as RtkExecResult;
    },
  };
}
