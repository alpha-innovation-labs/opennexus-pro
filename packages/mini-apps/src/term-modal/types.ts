import type { ExtensionContext } from "@mariozechner/pi-coding-agent";
import type { KeyId, OverlayHandle } from "@mariozechner/pi-tui";

/**
 * Terminal cell styling metadata reconstructed from xterm cells.
 */
export type CellAttrs = {
	fgDefault: boolean;
	fgRGB: boolean;
	fgPalette: boolean;
	fgColor: number;
	bgDefault: boolean;
	bgRGB: boolean;
	bgPalette: boolean;
	bgColor: number;
	bold: boolean;
	dim: boolean;
	italic: boolean;
	underline: boolean;
	inverse: boolean;
	strikethrough: boolean;
};

/**
 * Display buffer contract used by the terminal modal.
 */
export type XtermBuffer = {
	write: (data: string) => void;
	input: (data: string) => void;
	resize: (cols: number, rows: number) => void;
	clear: () => void;
	getDisplayLines: (start: number, end: number) => string[];
	lineCount: () => number;
};

/**
 * PTY manager contract used by the terminal modal runtime.
 */
export type PtyManager = {
	start: (cwd: string, cols: number, rows: number) => void;
	write: (data: string) => void;
	resize: (cols: number, rows: number) => void;
	kill: () => void;
	onData: (cb: (data: string) => void) => () => void;
	onExit: (cb: () => void) => () => void;
	clearError: () => void;
	isRunning: () => boolean;
	error: () => string | null;
	pid: () => number | null;
};

/**
 * Overlay handles needed to refresh and close one terminal modal.
 */
export type TerminalOverlayRuntime = {
	handle?: OverlayHandle;
	finish?: () => void;
	refresh?: () => void;
	close?: () => void;
	closed?: boolean;
};

/**
 * Declarative terminal shortcut loaded from keybindings configuration.
 */
export type TermShortcutBinding = {
	name: string;
	keys: KeyId[];
	description: string;
	command: string | null;
};

/**
 * Mutable runtime state for one named terminal session.
 */
export type TerminalSessionState = {
	key: string;
	title: string;
	xterm: XtermBuffer | null;
	pty: PtyManager;
	sessionCwd: string;
	overlay: TerminalOverlayRuntime | null;
	unsubData: (() => void) | null;
	unsubExit: (() => void) | null;
	ctx: ExtensionContext | null;
};

/**
 * Mutable runtime state for the terminal modal extension.
 */
export type TerminalState = {
	sessions: Map<string, TerminalSessionState>;
	activeSessionKey: string;
};
