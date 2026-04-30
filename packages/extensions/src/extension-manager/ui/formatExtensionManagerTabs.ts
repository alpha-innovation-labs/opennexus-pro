import type { ExtensionCommandContext } from "@mariozechner/pi-coding-agent";
import type { ExtensionManagerTab } from "../model/types.js";

const labels: Record<ExtensionManagerTab, string> = {
	all: "All",
	core: "Core",
	user: "User",
};

/**
 * Formats extension manager tabs for the modal header.
 *
 * @param activeTab Active tab.
 * @param theme Active UI theme.
 * @returns Renderable tab label.
 */
export function formatExtensionManagerTabs(activeTab: ExtensionManagerTab, theme: ExtensionCommandContext["ui"]["theme"]): string {
	return (Object.keys(labels) as ExtensionManagerTab[])
		.map((tab) => theme.secondary(`${tab === activeTab ? "●" : "○"} ${labels[tab]}`))
		.join(theme.muted(" | "));
}
