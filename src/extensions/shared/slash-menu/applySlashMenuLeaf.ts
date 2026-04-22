import type { ExtensionContext } from "@mariozechner/pi-coding-agent";
import { setTheme } from "../../../../node_modules/@mariozechner/pi-coding-agent/dist/modes/interactive/theme/theme.js";
import { SettingsManager } from "../../../../node_modules/@mariozechner/pi-coding-agent/dist/core/settings-manager.js";
import { setToolGroupCollapseEnabled } from "../../tron/collapse/state.js";
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

  switch (leaf.value) {
    case "autoCompact": settings.setCompactionEnabled(nextValue === "true"); setToolGroupCollapseEnabled(nextValue === "true"); break;
    case "showImages": settings.setShowImages(nextValue === "true"); break;
    case "autoResizeImages": settings.setImageAutoResize(nextValue === "true"); break;
    case "blockImages": settings.setBlockImages(nextValue === "true"); break;
    case "enableSkillCommands": settings.setEnableSkillCommands(nextValue === "true"); break;
    case "showHardwareCursor": settings.setShowHardwareCursor(nextValue === "true"); break;
    case "editorPaddingX": settings.setEditorPaddingX(Number(nextValue)); break;
    case "autocompleteMaxVisible": settings.setAutocompleteMaxVisible(Number(nextValue)); break;
    case "clearOnShrink": settings.setClearOnShrink(nextValue === "true"); break;
    case "steeringMode": settings.setSteeringMode(nextValue as "all" | "one-at-a-time"); break;
    case "followUpMode": settings.setFollowUpMode(nextValue as "all" | "one-at-a-time"); break;
    case "transport": settings.setTransport(nextValue as "sse" | "websocket" | "auto"); break;
    case "thinking": setThinkingLevel(nextValue); break;
    case "hideThinkingBlock": settings.setHideThinkingBlock(nextValue === "true"); break;
    case "collapseChangelog": settings.setCollapseChangelog(nextValue === "true"); break;
    case "enableInstallTelemetry": settings.setEnableInstallTelemetry(nextValue === "true"); break;
    case "doubleEscapeAction": settings.setDoubleEscapeAction(nextValue as "tree" | "fork" | "none"); break;
    case "treeFilterMode": settings.setTreeFilterMode(nextValue as "default" | "no-tools" | "user-only" | "labeled-only" | "all"); break;
    case "quietStartup": settings.setQuietStartup(nextValue === "true"); break;
    default:
      if (leaf.kind === "theme" && leaf.value !== "theme") {
        setTheme(leaf.value, true);
        settings.setTheme(leaf.value);
        return `theme set to ${leaf.value}`;
      }
      return "";
  }

  return `${leaf.label}: ${nextValue}`;
}
