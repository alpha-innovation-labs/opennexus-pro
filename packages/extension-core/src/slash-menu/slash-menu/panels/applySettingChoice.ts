import type { ExtensionContext } from "@earendil-works/pi-coding-agent";
import type { SlashMenuLeaf } from "../types.ts";
import { applySlashMenuSettingValue } from "../../applySlashMenuSettingValue.ts";

/**
 * Applies a setting choice and returns the previous level.
 * Pure function — returns the action the class should apply.
 */
export function applySettingChoice(
  ctx: ExtensionContext,
  pendingLeaf: SlashMenuLeaf,
  value: string,
  previousLevels: string[],
  setThinkingLevel: (v: string) => void,
): { status?: string; previousLevel: string; settingValue: string } {
  const settingValue = pendingLeaf.value;
  const status = applySlashMenuSettingValue(ctx, pendingLeaf, value, setThinkingLevel);
  return {
    status,
    previousLevel: previousLevels.pop() ?? "settings",
    settingValue,
  };
}
