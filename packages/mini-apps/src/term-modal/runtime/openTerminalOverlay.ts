import type { ExtensionCommandContext, ExtensionContext } from "@mariozechner/pi-coding-agent";
import { TerminalModal } from "../ui/TerminalModal.js";
import type { TerminalOverlayRuntime, TerminalState } from "../types.js";
import { attachTerminalToContext } from "./attachTerminalToContext.js";
import { ensureTerminalStarted } from "./ensureTerminalStarted.js";
import { getTerminalSession } from "./getTerminalSession.js";
import { hideTerminalOverlay } from "./hideTerminalOverlay.js";
import { setActiveTerminalSession } from "./setActiveTerminalSession.js";

/**
 * Opens or focuses one named floating terminal modal.
 *
 * @param state Terminal extension state.
 * @param ctx Interactive extension context.
 * @param terminalKey Named terminal session key.
 */
export async function openTerminalOverlay(
	state: TerminalState,
	ctx: ExtensionCommandContext | ExtensionContext,
	terminalKey = "main",
): Promise<void> {
	if (!ctx.hasUI) {
		ctx.ui.notify("/term-modal requires interactive mode.", "error");
		return;
	}
	setActiveTerminalSession(state, terminalKey);
	const session = getTerminalSession(state, terminalKey);
	attachTerminalToContext(session, ctx);
	if (session.overlay?.handle) {
		session.overlay.handle.setHidden(false);
		session.overlay.handle.focus();
		session.overlay.refresh?.();
		return;
	}
	if (!ensureTerminalStarted(session, session.sessionCwd || ctx.cwd)) {
		ctx.ui.notify(`${session.title} unavailable: ${session.pty.error()}`, "error");
		return;
	}
	const runtime: TerminalOverlayRuntime = {};
	const closeRuntime = () => {
		if (runtime.closed) return;
		runtime.closed = true;
		runtime.handle?.hide();
		if (session.overlay === runtime) {
			session.overlay = null;
		}
		runtime.finish?.();
	};
	session.overlay = runtime;
	runtime.close = closeRuntime;
	await ctx.ui.custom<void>(
		async (tui, theme, _keybindings, done) => {
			runtime.finish = () => done();
			const modal = new TerminalModal(tui, theme, session.title, session.xterm!, session.pty, () => hideTerminalOverlay(state));
			modal.focused = true;
			runtime.refresh = () => {
				modal.focused = runtime.handle?.isFocused() ?? false;
				tui.requestRender();
			};
			if (runtime.closed) {
				done();
			}
			modal.setRefresh(() => tui.requestRender());
			return modal;
		},
		{
			overlay: true,
			overlayOptions: {
				width: "100%",
				minWidth: 72,
				maxHeight: "85%",
				anchor: "top-center",
				margin: { top: 1 },
			},
			onHandle: (handle) => {
				runtime.handle = handle;
				handle.focus();
				if (runtime.closed) {
					closeRuntime();
				}
			},
		},
	).catch((error) => {
		if (session.overlay === runtime) {
			session.overlay = null;
		}
		ctx.ui.notify(error instanceof Error ? error.message : String(error), "error");
	});
}
