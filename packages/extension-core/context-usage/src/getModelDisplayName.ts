import type {
	ExtensionCommandContext,
	ExtensionContext,
} from "@earendil-works/pi-coding-agent";

/**
 * Gets the active model display name for context usage output.
 *
 * @param ctx Extension context with the active model.
 * @returns Displayable model name.
 */
export function getModelDisplayName(
	ctx: ExtensionContext | ExtensionCommandContext,
): string {
	const model = ctx.model;
	return model?.name || model?.id || "Unknown model";
}
