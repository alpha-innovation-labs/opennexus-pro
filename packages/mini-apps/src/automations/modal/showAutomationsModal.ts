import type { ExtensionCommandContext } from "@earendil-works/pi-coding-agent";
import { createPanelOverlayOptions } from "@nexus/tui-kit/modal/createPanelOverlayOptions.js";
import { sendAutomationChatMessage } from "../chat/sendAutomationChatMessage.js";
import { listAutomations } from "../core/storage/listAutomations.js";
import type { AutomationRecord } from "../core/storage/types.js";
import { AutomationEditorModal } from "./AutomationEditorModal.js";
import { AutomationPickerModal } from "./AutomationPickerModal.js";

/**
 * Opens the full-screen automations picker and editor modal flow.
 *
 * @param ctx Extension command context.
 */
export async function showAutomationsModal(ctx: ExtensionCommandContext): Promise<void> {
	if (!ctx.hasUI) {
		ctx.ui.notify("/automations requires an interactive UI session.", "warning");
		return;
	}
	const automations = listAutomations();
	if (automations.length === 0) {
		ctx.ui.notify("No automations found. Create one with nexus automations create.", "warning");
		return;
	}
	const selected = await pickAutomation(ctx, automations);
	if (!selected) return;
	await showAutomationEditor(ctx, selected);
}

/**
 * Opens the automation picker and returns the selected automation.
 *
 * @param ctx Extension command context.
 * @param automations Automation records.
 * @returns Selected automation, or undefined.
 */
async function pickAutomation(ctx: ExtensionCommandContext, automations: AutomationRecord[]): Promise<AutomationRecord | undefined> {
	return ctx.ui.custom<AutomationRecord | undefined>((_tui, theme, _keybindings, done) => new AutomationPickerModal(theme, automations, done, () => done(undefined)), { overlay: true, overlayOptions: createPanelOverlayOptions(1, "100%") });
}

/**
 * Opens the automation editor modal for one automation.
 *
 * @param ctx Extension command context.
 * @param automation Automation record.
 */
async function showAutomationEditor(ctx: ExtensionCommandContext, automation: AutomationRecord): Promise<void> {
	await ctx.ui.custom<void>((tui, _theme, _keybindings, done) => new AutomationEditorModal(automation, (record, messages, input, onUpdate) => sendAutomationChatMessage(ctx, record, messages, input, onUpdate), done, () => tui.requestRender()), { overlay: true, overlayOptions: { anchor: "center", width: "100%", minWidth: 80, maxHeight: "100%", margin: 0 } });
}
