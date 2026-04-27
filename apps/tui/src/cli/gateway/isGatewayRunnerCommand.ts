import { GATEWAY_RUNNER_COMMAND } from "@nexus/gateway-core/shared/constants.js";

/**
 * Reports whether argv targets the internal gateway daemon runner.
 *
 * @param argv Raw CLI args.
 * @returns True when the hidden daemon runner is requested.
 */
export function isGatewayRunnerCommand(argv: readonly string[]): boolean {
	return argv[0] === "gateway" && argv[1] === GATEWAY_RUNNER_COMMAND;
}
