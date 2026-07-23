import type { ExtensionCommandContext } from "@earendil-works/pi-coding-agent";

/**
 * Lazily loads and runs the wallet extension command handler.
 *
 * @param args Slash-command argument text.
 * @param ctx Extension command context.
 */
export async function handleWalletExtensionCommand(args: string, ctx: ExtensionCommandContext): Promise<void> {
	const { createWalletCommandHandler } = await import("./createWalletCommandHandler.js");
	await createWalletCommandHandler()(args, ctx);
}
