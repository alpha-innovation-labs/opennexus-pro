import type { ModelMenuTab } from "./ModelMenuTab";

/**
 * Gets the display label for one model-menu tab.
 *
 * @param tab Model-menu tab id.
 * @returns Human-facing tab label.
 */
export function getModelMenuTabLabel(tab: ModelMenuTab): string {
	return tab === "models" ? "Models" : "All models";
}
