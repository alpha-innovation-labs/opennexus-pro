import type { ContextUsageDetailItem } from "./types.js";
import { formatDetailConnector } from "./formatDetailConnector.js";
import { formatTokenCount } from "./formatTokenCount.js";

/**
 * Formats a detail section with tokenized child rows.
 *
 * @param title Section title.
 * @param command Related slash command hint.
 * @param items Detail rows.
 * @returns Section lines.
 */
export function formatDetailSection(title: string, command: string, items: readonly ContextUsageDetailItem[]): string[] {
  const commandText = command.length > 0 ? ` · ${command}` : "";
  const lines = ["", `${title}${commandText}`];
  if (items.length === 0) return [...lines, "└─ none loaded"];
  return [...lines, ...items.map((item, index) => `${formatDetailConnector(index, items.length)} ${item.label}: ${formatTokenCount(item.tokens)} tokens`)];
}
