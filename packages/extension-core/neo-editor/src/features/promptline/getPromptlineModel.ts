import type { ExtensionContext } from "@earendil-works/pi-coding-agent";
import { getPromptlineModelOverride } from "./state";

/**
 * Resolves the model that promptline chrome should render.
 *
 * @param ctx Active extension context.
 * @returns Override model from immediate selection, or context model.
 */
export function getPromptlineModel(ctx: ExtensionContext): ExtensionContext["model"] {
	return getPromptlineModelOverride() ?? ctx.model;
}
