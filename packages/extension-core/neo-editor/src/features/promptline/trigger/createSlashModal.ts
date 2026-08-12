import type {
	ExtensionAPI,
	ExtensionContext,
} from "@earendil-works/pi-coding-agent";
import { SlashMenuModal } from "@extensions/slash-menu";
import type { ShowOverlay, TriggerModalHandle } from "./types";

/**
 * Creates and shows the slash trigger modal.
 *
 * @param ctx Extension context.
 * @param requestClose Close callback.
 * @param requestRender Render callback.
 * @param setText Editor text setter.
 * @param getThinkingLevel Thinking-level getter.
 * @param setThinkingLevel Thinking-level setter.
 * @param submitText Editor submit callback.
 * @param showOverlay Overlay factory.
 * @param getCommands Live slash-command getter.
 * @param getAllTools Live tool metadata getter.
 * @returns Slash modal and handle.
 */
export function createSlashModal(
	ctx: ExtensionContext,
	requestClose: () => void,
	requestRender: () => void,
	setText: (value: string) => void,
	getThinkingLevel: () => string,
	setThinkingLevel: (value: string) => void,
	submitText: (value: string) => void,
	showOverlay: ShowOverlay,
	getCommands: ExtensionAPI["getCommands"] = () => [],
	getAllTools: ExtensionAPI["getAllTools"] = () => [],
): { modal: SlashMenuModal; handle: TriggerModalHandle } {
	const modal = new SlashMenuModal(
		ctx,
		getThinkingLevel,
		setThinkingLevel,
		requestClose,
		requestRender,
		(commandText) => {
			requestClose();
			requestRender();
			submitText(commandText);
		},
		getCommands,
		async () => undefined,
		(commandText) => {
			requestClose();
			setText(commandText);
			requestRender();
		},
		getAllTools,
	);
	const handle = showOverlay(modal, {
		anchor: "center",
		width: "100%",
		minWidth: 80,
		maxHeight: "100%",
	});
	return { modal, handle };
}
