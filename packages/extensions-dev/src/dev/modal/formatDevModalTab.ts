import type { DevModalTheme } from "./types.js";

/**
 * Formats one dev modal variation tab.
 *
 * @param label Tab label.
 * @param selected Whether this tab is selected.
 * @param theme Theme color helpers.
 * @returns Renderable tab text.
 */
export function formatDevModalTab(label: string, selected: boolean, theme: DevModalTheme): string {
  const marker = selected ? "●" : "○";
  const color = selected ? "accent" : "muted";
  const text = `${marker} ${label}`;
  return theme.fg(color, selected ? (theme.bold?.(text) ?? text) : text);
}
