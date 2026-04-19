import type { ExtensionContext } from "@mariozechner/pi-coding-agent";
import type { TUI } from "@mariozechner/pi-tui";
import { getPlaygroundStatus } from "./getPlaygroundStatus.js";
import { getTranscriptLines } from "./getTranscriptLines.js";
import { PlaygroundModal } from "./PlaygroundModal.js";
import type { PlaygroundState } from "../types.js";
import { sendPlaygroundMessage } from "../runtime/sendPlaygroundMessage.js";
import { startPlaygroundClients } from "../runtime/startPlaygroundClients.js";
import { closePlayground } from "./closePlayground.js";

/**
 * Opens or focuses the playground overlay and its ephemeral child Pi session.
 *
 * @param state Playground runtime state.
 * @param ctx Extension runtime context.
 */
export async function showPlayground(state: PlaygroundState, ctx: ExtensionContext): Promise<void> {
	if (!ctx.hasUI) return;
	if (state.overlayHandle) {
		state.overlayHandle.setHidden(false);
		state.overlayHandle.focus();
		return;
	}
	try {
		await startPlaygroundClients(state, ctx);
	} catch (error) {
		ctx.ui.notify(error instanceof Error ? error.message : String(error), "error");
		return;
	}
	void ctx.ui.custom<void>(
		async (tui: TUI, theme, keybindings, done) => {
			state.finish = () => done();
			state.requestRender = () => tui.requestRender();
			return new PlaygroundModal(
				tui,
				theme,
				keybindings,
				(width) => state.panes.map((pane) => ({
					key: pane.key,
					title: pane.title,
					status: pane.status,
					busy: pane.busy,
					lines: getTranscriptLines(pane, width, theme),
				})),
				() => getPlaygroundStatus(state),
				(value) => {
					void sendPlaygroundMessage(state, value);
				},
				() => {
					void closePlayground(state);
				},
			);
		},
		{
			overlay: true,
			overlayOptions: {
				anchor: "center",
				width: "90%",
				maxHeight: "80%",
			},
			onHandle: (handle) => {
				state.overlayHandle = handle;
				handle.setHidden(false);
				handle.focus();
			},
		},
	);
}
