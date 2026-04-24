import { KEYBINDINGS } from "../../node_modules/@mariozechner/pi-coding-agent/dist/core/keybindings.js";
import { InteractiveMode } from "../../node_modules/@mariozechner/pi-coding-agent/dist/modes/interactive/interactive-mode.js";
import { invalidateActivityKeys } from "../extensions/tron/activity/invalidateActivityKeys.ts";
import { activityInvalidators } from "../extensions/tron/activity/state.ts";
import { toggleToolGroupCollapse } from "../extensions/tron/collapse/state.ts";

type InteractiveModeWithCollapsePatch = {
	defaultEditor: { onAction(action: string, handler: () => void): void };
	showStatus(message: string): void;
	ui: { requestRender(): void };
	chatContainer: { clear(): void; addChild(child: unknown): void };
	rebuildChatFromMessages(): void;
	streamingComponent?: { updateContent(message: unknown): void };
	streamingMessage?: unknown;
};

type InteractiveModePrototypeWithPatch = {
	__nexusToolGroupCollapsePatched__?: boolean;
	setupKeyHandlers(): void;
};

/**
 * Adds the Tron collapsed-tool-group shortcut to Pi interactive mode.
 */
export function applyToolGroupCollapsePatch(): void {
	(KEYBINDINGS as unknown as Record<string, { defaultKeys: string; description: string }>)["app.tools.collapse"] = {
		defaultKeys: "shift+ctrl+c",
		description: "Collapse tool groups into summaries",
	};

	const prototype = InteractiveMode.prototype as unknown as InteractiveModePrototypeWithPatch;
	if (prototype.__nexusToolGroupCollapsePatched__) return;

	const originalSetupKeyHandlers = prototype.setupKeyHandlers;
	prototype.setupKeyHandlers = function setupKeyHandlersWithCollapsedToolGroups(this: InteractiveModeWithCollapsePatch): void {
		originalSetupKeyHandlers.call(this);
		this.defaultEditor.onAction("app.tools.collapse", () => {
			const collapsed = toggleToolGroupCollapse();
			invalidateActivityKeys([...activityInvalidators.keys()]);
			this.chatContainer.clear();
			this.rebuildChatFromMessages();
			if (this.streamingComponent && this.streamingMessage) {
				this.streamingComponent.updateContent(this.streamingMessage);
				this.chatContainer.addChild(this.streamingComponent);
			}
			this.ui.requestRender();
			this.showStatus(`Tool groups: ${collapsed ? "collapsed" : "expanded"}`);
		});
	};

	prototype.__nexusToolGroupCollapsePatched__ = true;
}
