import type { PiPackagesTab } from "../model/types.js";

const labels: Record<PiPackagesTab, string> = {
	all: "All",
	"third-party": "Third-party",
};

/**
 * Formats Pi packages tabs for the modal header.
 *
 * @param activeTab Active tab.
 * @param theme Active UI theme.
 * @returns Renderable tab label.
 */
export function formatPiPackagesTabs(activeTab: PiPackagesTab, theme: { fg(color: string, value: string): string }): string {
	return (Object.keys(labels) as PiPackagesTab[])
		.map((tab) => tab === activeTab ? theme.fg("accent", `● ${labels[tab]}`) : theme.fg("muted", `○ ${labels[tab]}`))
		.join(theme.fg("dim", " | "));
}
