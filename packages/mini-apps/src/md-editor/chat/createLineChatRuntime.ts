import type { ExtensionCommandContext } from "@earendil-works/pi-coding-agent";

/**
 * Captures the active model/provider identity for a line-chat turn.
 */
export function createLineChatRuntime(ctx: ExtensionCommandContext): { provider?: string; modelId?: string; toolsEnabled: boolean } {
	return {
		provider: ctx.model?.provider,
		modelId: ctx.model?.id,
		toolsEnabled: true,
	};
}
