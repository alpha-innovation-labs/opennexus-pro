import type {
	ExtensionAPI,
	ExtensionCommandContext,
} from "@earendil-works/pi-coding-agent";

/**
 * Hidden slash command handler.
 */
export type InternalSlashHandler = (
	args: string,
	ctx: ExtensionCommandContext,
	pi: ExtensionAPI,
) => Promise<void>;
