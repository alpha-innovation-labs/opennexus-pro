import type { ExtensionCommandContext } from "@mariozechner/pi-coding-agent";
import { visibleWidth } from "@mariozechner/pi-tui";
import { wrapPlainText } from "../../../../tron/user-message/wrapPlainText.js";

const USER_ROW_WIDTH = 86;

/**
 * Renders a tree user row with the same compact input-bubble shape as Tron.
 *
 * @param text User message text.
 * @param expanded Whether the conversation is expanded.
 * @param theme UI theme.
 * @returns Rendered user row lines.
 */
export function createTreeUserLines(text: string, expanded: boolean, theme: ExtensionCommandContext["ui"]["theme"]): string[] {
  const stateIcon = expanded ? "▾" : "▸";
  const maxInnerWidth = Math.max(1, USER_ROW_WIDTH - 2);
  const contentLines = text.replace(/\r\n/g, "\n").split("\n");
  const rendered = contentLines.flatMap((line, index) => {
    const prefix = index === 0 ? "» " : "";
    return wrapPlainText(`${prefix}${line}`, maxInnerWidth).map((segment, segmentIndex) => ({
      plain: segment,
      styled: index === 0 && segmentIndex === 0 && segment.startsWith("» ")
        ? `${theme.fg("error", "» ")}${theme.fg("text", segment.slice(2))}`
        : theme.fg("text", segment),
    }));
  });
  const innerWidth = Math.max(1, ...rendered.map((line) => visibleWidth(line.plain)));
  return [
    `${stateIcon} ${theme.fg("error", `╭${"─".repeat(innerWidth)}╮`)}`,
    ...rendered.map((line) => {
      const pad = " ".repeat(Math.max(0, innerWidth - visibleWidth(line.plain)));
      return `  ${theme.fg("error", "│")}${line.styled}${pad}${theme.fg("error", "│")}`;
    }),
    `  ${theme.fg("error", `╰${"─".repeat(innerWidth)}╯`)}`,
  ];
}
