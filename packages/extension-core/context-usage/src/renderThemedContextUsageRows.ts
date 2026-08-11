import type { SharedModalTheme } from "@nexus/tui-kit/modal/index";
import { formatDetailConnector } from "./formatDetailConnector";
import { formatMaybeTokenCount } from "./formatMaybeTokenCount";
import { formatPercent } from "./formatPercent";
import { formatThemedDetailSection } from "./formatThemedDetailSection";
import { formatTokenCount } from "./formatTokenCount";
import { colorContextUsageMarker } from "./getContextUsageMarkerColor";
import { renderNeoContextMeter } from "./renderNeoContextMeter";
import { renderThemedContextUsageMeter } from "./renderThemedContextUsageMeter";
import type { ContextUsageReport } from "./types";

/**
 * Renders colored context usage rows for the shared modal.
 *
 * @param report Current context usage report.
 * @param theme Shared modal theme.
 * @returns Colored modal rows.
 */
export function renderThemedContextUsageRows(
	report: ContextUsageReport,
	theme: SharedModalTheme,
): string[] {
	const topMeter = renderNeoContextMeter(report.usedPercent);
	const rowMeters = renderThemedContextUsageMeter(report.categories, theme);
	const usedTokens = formatMaybeTokenCount(report.usedTokens);
	return [
		`${topMeter}   ${theme.fg("accent", report.modelName)} ${theme.fg("muted", `· ${usedTokens}/${formatTokenCount(report.contextWindow)} tokens (${formatPercent(report.usedPercent)})`)}`,
		"",
		`${rowMeters[1] ?? ""}   ${theme.fg("dim", "Estimated usage by category")}`,
		...report.categories.map(
			(category, index) =>
				`${rowMeters[index + 2] ?? "         "}     ${theme.fg("dim", formatDetailConnector(index, report.categories.length))} ${colorContextUsageMarker(theme, category.marker)} ${category.label}: ${theme.fg("muted", `${formatTokenCount(category.tokens)} tokens (${formatPercent(category.percent)})`)}`,
		),
		...formatThemedDetailSection(theme, "System tools", "", report.systemTools),
		...formatThemedDetailSection(theme, "MCP tools", "/mcp", report.mcpTools),
		...formatThemedDetailSection(theme, "AGENTS.md", "", report.agentsFiles),
		...formatThemedDetailSection(theme, "Skills", "/skills", report.skills),
	];
}
