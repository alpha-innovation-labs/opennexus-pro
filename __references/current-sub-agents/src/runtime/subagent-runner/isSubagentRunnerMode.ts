/**
 * Internal CLI flag used to boot the detached subagent runner mode.
 */
export const SUBAGENT_RUNNER_FLAG = "--subagent-runner";

/**
 * Checks whether argv targets the internal subagent runner mode.
 *
 * @param argv CLI arguments excluding the node executable.
 * @returns True when the internal runner flag is present first.
 */
export function isSubagentRunnerMode(argv: string[]): boolean {
  return argv[0] === SUBAGENT_RUNNER_FLAG;
}
