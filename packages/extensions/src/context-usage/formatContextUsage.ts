import type { ContextUsageReport } from "./types.js";
import { formatDetailConnector } from "./formatDetailConnector.js";
import { formatDetailSection } from "./formatDetailSection.js";
import { formatMaybeTokenCount } from "./formatMaybeTokenCount.js";
import { formatPercent } from "./formatPercent.js";
import { formatTokenCount } from "./formatTokenCount.js";
import { renderNeoContextMeter } from "./renderNeoContextMeter.js";

/**
 * Formats the current context usage report for plain command and tool output.
 *
 * @param report Current context usage report.
 * @returns Human-readable context-usage summary.
 */
export function formatContextUsage(report: ContextUsageReport | null): string {
  if (!report) return "Current context usage is unavailable because there is no active model context yet.";

  const meter = renderNeoContextMeter(report.usedPercent);
  const usedTokens = formatMaybeTokenCount(report.usedTokens);
  const lines = [
    report.title,
    `${meter}   ${report.modelName} · ${usedTokens}/${formatTokenCount(report.contextWindow)} tokens (${formatPercent(report.usedPercent)})`,
    "",
    "Estimated usage by category",
    ...report.categories.map((category, index) => `  ${formatDetailConnector(index, report.categories.length)} ${category.marker} ${category.label}: ${formatTokenCount(category.tokens)} tokens (${formatPercent(category.percent)})`),
    ...formatDetailSection("System tools", "", report.systemTools),
    ...formatDetailSection("MCP tools", "/mcp", report.mcpTools),
    ...formatDetailSection("AGENTS.md", "", report.agentsFiles),
    ...formatDetailSection("Skills", "/skills", report.skills),
  ];

  return lines.join("\n");
}
