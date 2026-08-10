import type { SharedModalTheme } from "@nexus/tui-kit/modal/index";

/**
 * Formats one RTK savings period tab.
 *
 * @param label Period label.
 * @param selected Whether this tab is selected.
 * @param theme Active UI theme.
 * @returns Renderable tab text.
 */
export function formatRtkSavingsPeriodTab(label: string, selected: boolean, theme: SharedModalTheme): string {
  const marker = selected ? "●" : "○";
  const text = `${marker} ${label}`;
  const color = selected ? "accent" : "muted";
  return theme.fg(color, text);
}
