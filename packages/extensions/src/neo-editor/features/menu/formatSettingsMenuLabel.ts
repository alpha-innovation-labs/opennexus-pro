import { visibleWidth } from "@mariozechner/pi-tui";
import type { SelectPreviewTheme } from "@nexus/tui-kit/modal/index.js";

export const SETTINGS_VALUE_COLUMN = 32;

/**
 * Formats one settings row with the value starting at a fixed column.
 *
 * @param label Visible settings label.
 * @param value Current settings value.
 * @param theme Active UI theme.
 * @param icon Leading row icon.
 * @returns Formatted settings row label.
 */
export function formatSettingsMenuLabel(label: string, value: string | undefined, theme: SelectPreviewTheme, icon = ""): string {
  const labelText = icon ? `${icon} ${label}` : label;
  const visibleLabelWidth = visibleWidth(labelText);
  const spacing = " ".repeat(Math.max(2, SETTINGS_VALUE_COLUMN - visibleLabelWidth));
  return `${labelText}${spacing}${theme.fg("muted", value ?? "")}`;
}
