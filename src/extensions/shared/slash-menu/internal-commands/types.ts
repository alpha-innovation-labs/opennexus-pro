import type { ExtensionAPI, ExtensionCommandContext } from "@mariozechner/pi-coding-agent";

/**
 * Hidden slash command handler.
 */
export type InternalSlashHandler = (args: string, ctx: ExtensionCommandContext, pi: ExtensionAPI) => Promise<void>;
