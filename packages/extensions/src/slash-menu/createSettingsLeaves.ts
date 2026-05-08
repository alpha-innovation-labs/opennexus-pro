import type { Api, Model } from "@mariozechner/pi-ai";
import { SettingsManager } from "../../../../node_modules/@mariozechner/pi-coding-agent/dist/core/settings-manager.js";
import { getAvailableThemes } from "../../../../node_modules/@mariozechner/pi-coding-agent/dist/modes/interactive/theme/theme.js";
import { createThinkingSettingLeaf } from "./createThinkingSettingLeaf.js";
import { sortSlashMenuItemsByLabel } from "./sortSlashMenuItemsByLabel.js";
import type { SlashMenuLeaf } from "./types.js";

/**
 * Builds settings entries from the live Pi runtime settings contract.
 *
 * @param cwd Project cwd.
 * @param thinkingLevel Current session thinking level.
 * @param model Current session model.
 * @returns Settings leaf entries.
 */
export async function createSettingsLeaves(
  cwd: string,
  thinkingLevel: string,
  model: Model<Api> | undefined,
): Promise<SlashMenuLeaf[]> {
  const settings = SettingsManager.create(cwd);
  return sortSlashMenuItemsByLabel([
    { kind: "toggle", label: "Auto-compact", description: "Automatically compact context when it gets too large", value: "autoCompact", currentValue: String(settings.getCompactionEnabled()), options: ["true", "false"] },
    { kind: "toggle", label: "Show images", description: "Render images inline in terminal", value: "showImages", currentValue: String(settings.getShowImages()), options: ["true", "false"] },
    { kind: "toggle", label: "Auto-resize images", description: "Resize large images to 2000x2000 max for better model compatibility", value: "autoResizeImages", currentValue: String(settings.getImageAutoResize()), options: ["true", "false"] },
    { kind: "toggle", label: "Block images", description: "Prevent images from being sent to LLM providers", value: "blockImages", currentValue: String(settings.getBlockImages()), options: ["true", "false"] },
    { kind: "toggle", label: "Skill commands", description: "Register skills as /skill:name commands", value: "enableSkillCommands", currentValue: String(settings.getEnableSkillCommands()), options: ["true", "false"] },
    { kind: "toggle", label: "Show hardware cursor", description: "Show the terminal cursor while still positioning it for IME support", value: "showHardwareCursor", currentValue: String(settings.getShowHardwareCursor()), options: ["true", "false"] },
    { kind: "setting", label: "Editor padding", description: "Horizontal padding for input editor (0-3)", value: "editorPaddingX", currentValue: String(settings.getEditorPaddingX()), options: ["0", "1", "2", "3"] },
    { kind: "setting", label: "Autocomplete max items", description: "Max visible items in autocomplete dropdown (3-20)", value: "autocompleteMaxVisible", currentValue: String(settings.getAutocompleteMaxVisible()), options: ["3", "5", "7", "10", "15", "20"] },
    { kind: "toggle", label: "Clear on shrink", description: "Clear empty rows when content shrinks (may cause flicker)", value: "clearOnShrink", currentValue: String(settings.getClearOnShrink()), options: ["true", "false"] },
    { kind: "setting", label: "Steering mode", description: "Enter while streaming queues steering messages", value: "steeringMode", currentValue: settings.getSteeringMode(), options: ["one-at-a-time", "all"] },
    { kind: "setting", label: "Follow-up mode", description: "Alt+Enter queues follow-up messages until agent stops", value: "followUpMode", currentValue: settings.getFollowUpMode(), options: ["one-at-a-time", "all"] },
    { kind: "setting", label: "Transport", description: "Preferred transport for providers that support multiple transports", value: "transport", currentValue: settings.getTransport(), options: ["sse", "websocket", "auto"] },
    createThinkingSettingLeaf(thinkingLevel, model),
    { kind: "theme", label: "Theme", description: "Color theme for the interface", value: "theme", currentValue: settings.getTheme() || "dark", options: getAvailableThemes() },
    { kind: "toggle", label: "Hide thinking", description: "Hide thinking blocks in assistant responses", value: "hideThinkingBlock", currentValue: String(settings.getHideThinkingBlock()), options: ["true", "false"] },
    { kind: "toggle", label: "Collapse changelog", description: "Show condensed changelog after updates", value: "collapseChangelog", currentValue: String(settings.getCollapseChangelog()), options: ["true", "false"] },
    { kind: "toggle", label: "Install telemetry", description: "Send an anonymous version/update ping after changelog-detected updates", value: "enableInstallTelemetry", currentValue: String(settings.getEnableInstallTelemetry()), options: ["true", "false"] },
    { kind: "setting", label: "Double-escape action", description: "Action when pressing Escape twice with empty editor", value: "doubleEscapeAction", currentValue: settings.getDoubleEscapeAction(), options: ["tree", "fork", "none"] },
    { kind: "setting", label: "Tree filter mode", description: "Default filter when opening /tree", value: "treeFilterMode", currentValue: settings.getTreeFilterMode(), options: ["default", "no-tools", "user-only", "labeled-only", "all"] },
    { kind: "toggle", label: "Quiet startup", description: "Disable verbose printing at startup", value: "quietStartup", currentValue: String(settings.getQuietStartup()), options: ["true", "false"] },
  ]);
}
