import { type ExtensionAPI, type ExtensionContext } from "@mariozechner/pi-coding-agent";
import type { OverlayHandle, TUI } from "@mariozechner/pi-tui";
import { truncateToWidth, visibleWidth } from "@mariozechner/pi-tui";
import { withSlashMenuGroup } from "../neo-editor/features/menu/withSlashMenuGroup.js";

type WorkspaceTheme = {
	fg(color: string, value: string): string;
};
import { primeSessionsShortcut } from "./primeSessionsShortcut.js";
import { showSessionsModal } from "./showSessionsModal.js";
import { hideTopBarSpacer } from "./top-bar/hideTopBarSpacer.js";
import { showTopBarSpacer } from "./top-bar/showTopBarSpacer.js";

/**
 * Simple top overlay bar that renders the current session title.
 */
class WorkspaceTopBar {
	focused = false;

	constructor(
		private readonly theme: WorkspaceTheme,
		private readonly getSessionName: () => string | undefined,
	) {}

	/**
	 * Invalidates cached render state.
	 */
	invalidate(): void {}

	/**
	 * Renders the top bar content.
	 *
	 * @param width Available terminal width.
	 * @returns Rendered lines.
	 */
	render(width: number): string[] {
		const sessionTitle = this.getSessionName()?.trim() || "Untitled session";
		const title = truncateToWidth(sessionTitle, Math.max(20, width - 4), "…");
		const text = ` ${title} `;
		const top = this.theme.fg("error", `╭${"━".repeat(visibleWidth(text))}╮`);
		const body = this.theme.fg("error", "┃") + text + this.theme.fg("error", "┃");
		const bottom = this.theme.fg("error", `╰${"━".repeat(visibleWidth(text))}╯`);
		return [top, body, bottom];
	}
}

type OverlayRuntime = {
	handle?: OverlayHandle;
	finish?: () => void;
};

let runtime: OverlayRuntime | undefined;

/**
 * Shows the workspace top bar overlay.
 *
 * @param ctx Extension runtime context.
 */
function showWorkspaceTopBar(ctx: ExtensionContext): void {
	if (!ctx.hasUI) return;
	if (runtime?.handle) {
		runtime.handle.setHidden(false);
		return;
	}

	const nextRuntime: OverlayRuntime = {};
	runtime = nextRuntime;

	void ctx.ui.custom<void>(
		async (_tui: TUI, theme, _keybindings, done) => {
			nextRuntime.finish = () => done();
			return new WorkspaceTopBar(theme, () => ctx.sessionManager.getSessionName());
		},
		{
			overlay: true,
			overlayOptions: {
				anchor: "top-left",
				row: 0,
				col: 0,
				width: "100%",
				maxHeight: 3,
				nonCapturing: true,
				margin: 0,
			},
			onHandle: (handle) => {
				nextRuntime.handle = handle;
				handle.setHidden(false);
			},
		},
	);
}

/**
 * Hides the workspace top bar overlay.
 */
function hideWorkspaceTopBar(): void {
	if (!runtime) return;
	runtime.handle?.hide();
	runtime.finish?.();
	runtime = undefined;
}

/**
 * Registers workspace session navigation and its top bar UI.
 *
 * @param pi Pi extension API.
 */
export function registerWorkspaceExtension(pi: ExtensionAPI): void {
	pi.on("session_start", async (_event, ctx) => {
		if (!ctx.hasUI) return;
		showTopBarSpacer(ctx);
		showWorkspaceTopBar(ctx);
	});

	pi.on("session_shutdown", async (_event, ctx) => {
		hideWorkspaceTopBar();
		if (!ctx.hasUI) return;
		hideTopBarSpacer(ctx);
	});

	pi.registerCommand("sessions", withSlashMenuGroup({
		description: "Switch to another session",
		handler: async (_args, ctx) => {
			await showSessionsModal(ctx);
		},
	}, "Workspace"));

	pi.registerShortcut("ctrl+;", {
		description: "Prime the editor to auto-submit /sessions",
		handler: async (ctx) => {
			await primeSessionsShortcut(ctx);
		},
	});
}

export default registerWorkspaceExtension;
