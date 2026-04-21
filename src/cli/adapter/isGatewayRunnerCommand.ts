import { GATEWAY_RUNNER_COMMAND } from "../../gateway/shared/constants.js";

/**
 * Reports whether the argv targets the internal gateway daemon runner.
 *
 * @param argv Raw CLI args.
 * @returns True when the hidden daemon runner is requested.
 */
export function isGatewayRunnerCommand(argv: string[]): boolean {
  return argv[0] === "adapter" && argv[1] === GATEWAY_RUNNER_COMMAND;
}
