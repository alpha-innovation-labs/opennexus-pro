/**
 * Verifies that a compact tool call surfaces its error in the live view.
 *
 * pi tracks the error flag on the render context, not on the AgentToolResult
 * payload. The compact wrapper must inject it so the toolResult renderer
 * shows a FailedToolCallResult row instead of an empty one.
 */
import type { AgentToolResult, ToolDefinition, Theme } from "@earendil-works/pi-coding-agent";
import { beforeAll, describe, expect, it } from "vitest";
import { createCompactToolDefinition } from "../../packages/extension-core/tron/src/compact-tool-lines/createCompactToolDefinition";

const THEME_KEY = Symbol.for("@earendil-works/pi-coding-agent:theme");

beforeAll(() => {
	(globalThis as Record<symbol, unknown>)[THEME_KEY] = {
		fg: (_c: string, t: string) => t,
		bold: (t: string) => t,
		italic: (t: string) => t,
	};
});

/** Strip all ANSI sequences for structural assertions. */
const ESC = "\x1b";
const ANSI_RE = new RegExp(`${ESC}\\[[0-9;]*m`, "g");
function plain(text: string): string {
	return text.replace(ANSI_RE, "");
}

const theme = {
	fg: (_c: string, t: string) => t,
	bold: (t: string) => t,
} as Theme;

function makeDefinition(): ToolDefinition {
	return {
		name: "read",
		label: "read",
		description: "Read a file",
		parameters: {} as never,
		execute: async () => ({ content: [], details: undefined }),
	} as ToolDefinition;
}

function makeContext(isError: boolean, expanded = false): Parameters<NonNullable<ToolDefinition["renderResult"]>>[3] {
	return {
		toolCallId: "t1",
		invalidate: () => {},
		isError,
		expanded,
		args: {}, state: {}, cwd: process.cwd(), executionStarted: true,
		argsComplete: true, isPartial: false, showImages: false, lastComponent: undefined,
	};
}

describe("createCompactToolDefinition.renderResult", () => {
	it("shows the error row when the context reports an error", () => {
		const wrapped = createCompactToolDefinition(makeDefinition());
		const result: AgentToolResult<unknown> = {
			content: [{ type: "text", text: "ENOENT: no such file or directory" }],
			details: undefined,
		};
		const renderer = wrapped.renderResult!(
			result,
			{ expanded: false, isPartial: false },
			theme,
			makeContext(true),
		);
		const lines = renderer.render(60);
		const joined = lines.map(plain).join("\n");
		expect(joined).toContain("ENOENT: no such file or directory");
		expect(joined).toContain("read");
	});

	it("does not render a result row for a non-error result when collapsed", () => {
		const wrapped = createCompactToolDefinition(makeDefinition());
		const result: AgentToolResult<unknown> = {
			content: [{ type: "text", text: "file contents here" }],
			details: undefined,
		};
		const renderer = wrapped.renderResult!(
			result,
			{ expanded: false, isPartial: false },
			theme,
			makeContext(false),
		);
		const lines = renderer.render(60);
		// Collapsed non-error result renders nothing (the tool name row carries it).
		expect(lines).toEqual([]);
	});
});
