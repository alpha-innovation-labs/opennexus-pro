import type { Component, MarkdownTheme } from "@earendil-works/pi-tui";
import type { Theme } from "@earendil-works/pi-coding-agent";

/**
 * One role in a transcript entry.
 */
export type TranscriptEntryRole =
	| "user"
	| "assistant"
	| "thinking"
	| "tool"
	| "toolResult"
	| "error"
	| "system";

/**
 * One normalized transcript entry.
 */
export interface TranscriptEntry {
	role: TranscriptEntryRole;
	text: string;
	createdAt?: number;
	toolCallId?: string;
	toolName?: string;
	args?: Record<string, unknown>;
	result?: {
		isError: boolean;
		content?: unknown;
		details?: unknown;
	};
}

/**
 * Context passed when rendering a transcript entry.
 */
export interface RenderContext {
	theme: Theme;
	markdownTheme?: MarkdownTheme;
	connectThinkingToTools?: boolean;
	connectThinkingFromTool?: boolean;
	expanded?: boolean;
	xOffset?: number;
	resultChildRenderer?: EntryRenderer;
}

/**
 * Metadata about how one entry renders.
 */
export interface EntryMeta {
	hasAttachedResult: boolean;
	drawsOwnBottomBorder: boolean;
}

/**
 * Something that can render to terminal lines.
 */
export interface EntryRenderer {
	render(width: number): string[];
	invalidate?(): void;
}

/**
 * Result of creating a renderer for one transcript entry.
 */
export interface RenderTranscriptEntryResult {
	renderer: EntryRenderer;
	component?: Component;
	meta: EntryMeta;
}
