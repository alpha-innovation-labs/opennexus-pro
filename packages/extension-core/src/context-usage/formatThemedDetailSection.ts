import type { SharedModalTheme } from "@nexus/tui-kit/modal/index.js";
import type { ContextUsageDetailItem } from "./types.js";
import { formatDetailConnector } from "./formatDetailConnector.js";
import { formatTokenCount } from "./formatTokenCount.js";

/**
 * Formats a colored modal detail section with tokenized child rows.
 *
 * @param theme Shared modal theme.
 * @param title Section title.
 * @param command Related slash command hint.
 * @param items Detail rows.
 * @returns Section lines.
 */
export function formatThemedDetailSection(theme: SharedModalTheme, title: string, command: string, items: readonly ContextUsageDetailItem[]): string[] {
  const commandText = command.length > 0 ? ` · ${command}` : "";
  const lines = ["", `${theme.fg("accent", title)}${theme.fg("dim", commandText)}`];
  if (items.length === 0) return [...lines, `${theme.fg("dim", "└─")} ${theme.fg("dim", "none loaded")}`];
  return [...lines, ...items.map((item, index) => `${theme.fg("dim", formatDetailConnector(index, items.length))} ${item.label}: ${theme.fg("muted", `${formatTokenCount(item.tokens)} tokens`)}`)];
}
