import { RpcClient, type ExtensionContext } from "@mariozechner/pi-coding-agent";
import { getPiCliPath } from "./getPiCliPath.js";

/**
 * Creates the ephemeral Pi RPC client used by the playground modal.
 *
 * @param ctx Extension runtime context.
 * @returns Configured RPC client.
 */
export function createPlaygroundRpcClient(ctx: ExtensionContext): RpcClient {
	return new RpcClient({
		cliPath: getPiCliPath(),
		cwd: ctx.cwd,
		provider: ctx.model?.provider,
		model: ctx.model?.id,
		args: ["--no-session", "--no-extensions"],
	});
}
