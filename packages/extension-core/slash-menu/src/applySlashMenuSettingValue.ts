import type { ExtensionContext } from "@earendil-works/pi-coding-agent";
import { SettingsManager } from "@earendil-works/pi-coding-agent";
import { setToolGroupCollapseEnabled } from "@extensions/tron/collapse/state";
import { readNexusUserConfig } from "@nexus/runtime/config/readNexusUserConfig";
import { writeNexusUserConfig } from "@nexus/runtime/config/writeNexusUserConfig";
import type { SlashMenuLeaf } from "./types";

/**
 * Applies an explicit selected value for a settings leaf.
 *
 * @param ctx Extension context.
 * @param leaf Setting leaf to update.
 * @param nextValue Explicit value to apply.
 * @param setThinkingLevel Session thinking-level setter.
 * @returns Status text.
 */
export function applySlashMenuSettingValue(
	ctx: ExtensionContext,
	leaf: SlashMenuLeaf,
	nextValue: string,
	setThinkingLevel: (value: string) => void,
): string {
	const settings = SettingsManager.create(ctx.cwd);

	switch (leaf.value) {
		case "autoCompact":
			settings.setCompactionEnabled(nextValue === "true");
			setToolGroupCollapseEnabled(nextValue === "true");
			break;
		case "showImages":
			settings.setShowImages(nextValue === "true");
			break;
		case "autoResizeImages":
			settings.setImageAutoResize(nextValue === "true");
			break;
		case "blockImages":
			settings.setBlockImages(nextValue === "true");
			break;
		case "enableSkillCommands":
			settings.setEnableSkillCommands(nextValue === "true");
			break;
		case "showHardwareCursor":
			settings.setShowHardwareCursor(nextValue === "true");
			break;
		case "editorPaddingX":
			settings.setEditorPaddingX(Number(nextValue));
			break;
		case "autocompleteMaxVisible":
			settings.setAutocompleteMaxVisible(Number(nextValue));
			break;
		case "clearOnShrink":
			settings.setClearOnShrink(nextValue === "true");
			break;
		case "steeringMode":
			settings.setSteeringMode(nextValue as "all" | "one-at-a-time");
			break;
		case "followUpMode":
			settings.setFollowUpMode(nextValue as "all" | "one-at-a-time");
			break;
		case "transport":
			settings.setTransport(nextValue as "sse" | "websocket" | "auto");
			break;
		case "thinking":
			setThinkingLevel(nextValue);
			break;
		case "hideThinkingBlock":
			settings.setHideThinkingBlock(nextValue === "true");
			break;
		case "collapseChangelog":
			settings.setCollapseChangelog(nextValue === "true");
			break;
		case "enableInstallTelemetry":
			settings.setEnableInstallTelemetry(nextValue === "true");
			break;
		case "doubleEscapeAction":
			settings.setDoubleEscapeAction(nextValue as "tree" | "fork" | "none");
			break;
		case "treeFilterMode":
			settings.setTreeFilterMode(
				nextValue as
					| "default"
					| "no-tools"
					| "user-only"
					| "labeled-only"
					| "all",
			);
			break;
		case "quietStartup":
			settings.setQuietStartup(nextValue === "true");
			break;
		case "notifyEnabled": {
			const userConfig = readNexusUserConfig();
			const next = nextValue === "true";
			writeNexusUserConfig({ ...userConfig, notifyEnabled: next });
			break;
		}
		default:
			return "";
	}

	return `${leaf.label}: ${nextValue}`;
}
