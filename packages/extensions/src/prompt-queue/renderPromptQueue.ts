import { visibleWidth } from "@mariozechner/pi-tui";
import { getPromptlineFrameLeftPadding } from "../neo-editor/features/promptline/layout/getPromptlineFrameLeftPadding.js";
import { getPromptlineFrameWidth } from "../neo-editor/features/promptline/layout/getPromptlineFrameWidth.js";
import type { ExtensionContext } from "@mariozechner/pi-coding-agent";
import type { PromptQueueItem } from "./types.js";
import { formatPromptQueuePreview } from "./formatPromptQueuePreview.js";
import { getVisiblePromptQueueItems } from "./getVisiblePromptQueueItems.js";

const MAX_VISIBLE_QUEUE_ITEMS = 5;

/**
 * Pads one rendered queue row to the requested inner width.
 *
 * @param line Rendered row content.
 * @param innerWidth Target visible width.
 * @returns Padded row content.
 */
function padQueueRow(line: string, innerWidth: number): string {
  return `${line}${" ".repeat(Math.max(0, innerWidth - visibleWidth(line)))}`;
}

/**
 * Renders purple hotkey text followed by white label text.
 *
 * @param theme Nexus UI theme.
 * @param hotkey Hotkey label.
 * @param label Action label.
 * @returns Rendered hotkey segment.
 */
function renderHotkey(theme: ExtensionContext["ui"]["theme"], hotkey: string, label: string): string {
  return `${theme.fg("accent" as never, hotkey)} ${label}`;
}

/**
 * Renders the prompt queue top border with the title embedded.
 *
 * @param theme Nexus UI theme.
 * @param innerWidth Inner box width.
 * @returns Rendered top border.
 */
function renderQueueTopBorder(theme: ExtensionContext["ui"]["theme"], innerWidth: number, actions: string): string {
  const borderColor = "accent" as never;
  const title = " Queue ";
  const titlePrefix = `${theme.fg(borderColor, "╭─")}${title}`;
  const suffix = actions ? ` ${actions} ` : "";
  const remainingRule = Math.max(0, innerWidth - visibleWidth(title) - visibleWidth(suffix) - 1);
  return `${titlePrefix}${theme.fg(borderColor, "─".repeat(remainingRule))}${suffix}${theme.fg(borderColor, "╮")}`;
}

/**
 * Renders the prompt queue above the Neo editor.
 *
 * @param width Available terminal width.
 * @param items Queued prompt items.
 * @param selectedId Selected item id.
 * @param focused Whether queue navigation is focused.
 * @param theme Nexus UI theme.
 * @param hasMessages Whether the conversation already has messages.
 * @returns Rendered prompt queue lines.
 */
export function renderPromptQueue(width: number, items: PromptQueueItem[], selectedId: string | undefined, focused: boolean, theme: ExtensionContext["ui"]["theme"], hasMessages = true, editing = false, isPendingDispatch: (id: string) => boolean = () => false): string[] {
  if (items.length === 0) return [];
  const frameWidth = getPromptlineFrameWidth(width, hasMessages);
  const innerWidth = Math.max(20, frameWidth - 2);
  const leftPadding = " ".repeat(getPromptlineFrameLeftPadding(width, frameWidth));
  const borderColor = "accent" as never;
  const actions = editing
    ? [renderHotkey(theme, "Enter", "save edit"), renderHotkey(theme, "Alt+Enter", "send now")].join("  •  ")
    : focused
      ? [renderHotkey(theme, "hjkl/↑↓", "move"), renderHotkey(theme, "e", "edit"), renderHotkey(theme, "Enter", "send"), renderHotkey(theme, "dd", "delete"), renderHotkey(theme, "Esc", "close")].join("  •  ")
      : [renderHotkey(theme, "Ctrl+Shift+M", "focus queue")].join("");
  const lines = [`${leftPadding}${renderQueueTopBorder(theme, innerWidth, actions)}`];
  const visibleItems = getVisiblePromptQueueItems(items, selectedId, MAX_VISIBLE_QUEUE_ITEMS);
  for (const item of visibleItems) {
    const marker = item.id === selectedId ? "›" : " ";
    const status = isPendingDispatch(item.id) ? "sending next… " : "";
    const text = formatPromptQueuePreview(`${status}${item.text}`, Math.max(1, innerWidth - 3));
    const row = item.id === selectedId && focused ? `${marker} ${text}` : theme.fg("dim" as never, `${marker} ${text}`);
    lines.push(`${leftPadding}${theme.fg(borderColor, "│")}${padQueueRow(row, innerWidth)}${theme.fg(borderColor, "│")}`);
  }
  if (items.length > MAX_VISIBLE_QUEUE_ITEMS) {
    const hiddenCount = items.length - visibleItems.length;
    lines.push(`${leftPadding}${theme.fg(borderColor, "│")}${padQueueRow(theme.fg("dim" as never, `  ${hiddenCount} hidden`), innerWidth)}${theme.fg(borderColor, "│")}`);
  }
  lines.push(`${leftPadding}${theme.fg(borderColor, `╰${"─".repeat(innerWidth)}╯`)}`);
  return lines;
}
