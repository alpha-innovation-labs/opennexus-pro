import type { ExtensionContext, RpcClient } from "@mariozechner/pi-coding-agent";
import type { OverlayHandle } from "@mariozechner/pi-tui";

/**
 * One rendered transcript item in the playground modal.
 */
export type PlaygroundTranscriptEntry = {
	role: "user" | "assistant" | "tool" | "error" | "system";
	text: string;
};

/**
 * Minimal agent event shape consumed from the RPC child process.
 */
export type PlaygroundAgentEvent = {
	type?: string;
	message?: {
		role?: string;
		content?: Array<{ type?: string; text?: string }>;
		errorMessage?: string;
	};
	assistantMessageEvent?: {
		type?: string;
		delta?: string;
	};
	toolName?: string;
	args?: Record<string, unknown>;
	isError?: boolean;
	result?: {
		content?: Array<{ type?: string; text?: string }>;
	};
};

/**
 * Mutable runtime state for one child Pi pane.
 */
export type PlaygroundPaneState = {
	key: string;
	title: string;
	client: RpcClient | null;
	unsubscribe: (() => void) | null;
	transcript: PlaygroundTranscriptEntry[];
	liveAssistantText: string;
	status: string;
	busy: boolean;
};

/**
 * Mutable runtime state for the playground overlay and child Pi panes.
 */
export type PlaygroundState = {
	ctx: ExtensionContext | null;
	overlayHandle: OverlayHandle | null;
	finish: (() => void) | null;
	requestRender: (() => void) | null;
	panes: [PlaygroundPaneState, PlaygroundPaneState];
	closing: boolean;
};
