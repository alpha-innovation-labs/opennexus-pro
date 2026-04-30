import type { ExtensionManagerTab } from "../model/types.js";

const labels: Record<ExtensionManagerTab, string> = {
	all: "All",
	core: "Core",
	"third-party": "Third-party",
};

/**
 * Formats extension manager tabs for the modal header.
 *
 * @param activeTab Active tab.
 * @param theme Active UI theme.
 * @returns Renderable tab label.
 */
export function formatExtensionManagerTabs(activeTab: ExtensionManagerTab, theme: { fg(color: string, value: string): string }): string {
	return (Object.keys(labels) as ExtensionManagerTab[])
		.map((tab) => tab === activeTab ? theme.fg("accent", `● ${labels[tab]}`) : theme.fg("muted", `○ ${labels[tab]}`))
		.join(theme.fg("dim", " | "));
}
