import type {
	ExtensionAPI,
	ExtensionContext,
} from "@earendil-works/pi-coding-agent";
import { createPromptlineStatusWidget } from "./createPromptlineStatusWidget";
import { openPromptlineProviderPicker } from "../state";
import { setBelowEditorSlot } from "../../../../../subagent-tintin/src/ui/below-editor-layout";

/**
 * Renders the promptline metadata widget below the editor.
 *
 * @param ctx Pi extension context.
 * @param getThinkingLevel Pi thinking getter.
 * @param getSessionName Pi session name getter.
 */
export function renderPromptlineStatusWidget(
	ctx: ExtensionContext,
	getThinkingLevel: ExtensionAPI["getThinkingLevel"],
	getSessionName: ExtensionAPI["getSessionName"],
	getAgentCountsLabel?: () => string,
): void {
	setBelowEditorSlot(
		ctx.ui,
		"metadata",
		() => createPromptlineStatusWidget(ctx, getThinkingLevel, getSessionName, getAgentCountsLabel, openPromptlineProviderPicker),
	);
}
