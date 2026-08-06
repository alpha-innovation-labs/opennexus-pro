import type { ExtensionContext } from "@earendil-works/pi-coding-agent";
import { SettingsManager } from "@earendil-works/pi-coding-agent";
import { applySlashMenuSettingValue } from "./applySlashMenuSettingValue.js";
import type { SlashMenuLeaf } from "./types.js";

/**
 * Applies one selected slash-menu leaf action.
 *
 * @param ctx Extension context.
 * @param leaf Selected leaf.
 * @param setThinkingLevel Session thinking-level setter.
 * @returns Status text.
 */
export async function applySlashMenuLeaf(
  ctx: ExtensionContext,
  leaf: SlashMenuLeaf,
  setThinkingLevel: (value: string) => void,
): Promise<string> {
  const settings = SettingsManager.create(ctx.cwd);
  const current = leaf.currentValue ?? "";
  const options = leaf.options ?? [];
  const currentIndex = Math.max(0, options.indexOf(current));
  const nextValue = options[(currentIndex + 1) % options.length] ?? current;

  if (leaf.kind === "theme" && leaf.value !== "theme") {
    settings.setTheme(nextValue);
    return `theme set to ${nextValue}`;
  }

  return applySlashMenuSettingValue(ctx, leaf, nextValue, setThinkingLevel);
}
