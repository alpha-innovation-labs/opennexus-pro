import type { ExtensionContext } from "@earendil-works/pi-coding-agent";
import type { SlashMenuLeaf } from "../types";
import { createAvailableModelLeaves } from "./createAvailableModelLeaves";
import { createModelCatalogLeaves } from "./createModelCatalogLeaves";
import type { ModelMenuTab } from "./ModelMenuTab";

/**
 * Builds model-menu leaves for the selected tab.
 *
 * @param ctx Extension context with the live model registry.
 * @param tab Active model-menu tab.
 * @returns Leaves for the active model tab.
 */
export function createModelMenuLeaves(
	ctx: ExtensionContext,
	tab: ModelMenuTab,
): SlashMenuLeaf[] {
	return tab === "models"
		? createAvailableModelLeaves(ctx)
		: createModelCatalogLeaves();
}
