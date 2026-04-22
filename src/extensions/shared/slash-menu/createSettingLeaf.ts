import type { SlashMenuLeaf } from "./types.js";
import { formatSettingValue } from "./formatSettingValue.js";

/**
 * Converts one merged settings entry into a menu leaf.
 *
 * @param key Setting key.
 * @param value Setting value.
 * @returns Settings leaf.
 */
export function createSettingLeaf(key: string, value: unknown): SlashMenuLeaf {
  return {
    kind: key === "theme" ? "theme" : typeof value === "boolean" ? "toggle" : "setting",
    label: `${key}: ${formatSettingValue(value)}`,
    description: `Current value for ${key}.`,
    value: key,
  };
}
