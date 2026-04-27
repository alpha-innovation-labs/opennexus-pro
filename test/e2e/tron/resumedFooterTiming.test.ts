import assert from "node:assert/strict";
import test from "node:test";
import { AssistantMessageComponent } from "../../../node_modules/@mariozechner/pi-coding-agent/dist/modes/interactive/components/assistant-message.js";
import registerAssistantThinkingStyleExtension from "../../../packages/extensions/src/tron/thinking/registerAssistantThinkingStyleExtension.ts";
import { resetAssistantMessageTimings } from "../../../packages/extensions/src/tron/thinking/assistantMessageTimingState.js";
import { renderComponentInVirtualTerminal } from "../../support/render/renderComponentInVirtualTerminal.js";
import { initializePiThemes } from "../../support/theme/initializePiThemes.js";

type EventHandler = (event: unknown, ctx: unknown) => Promise<void>;

/**
 * Removes ANSI escape sequences from rendered terminal lines.
 *
 * @param line Rendered terminal line.
 * @returns Plain visible text.
 */
function stripAnsi(line: string): string {
	return line.replace(/\x1b\][^\x07]*\x07/g, "").replace(/\x1b\[[0-9;?]*[A-Za-z]/g, "");
}

/**
 * Creates a minimal extension harness with a resumable session branch.
 *
 * @param branch Session history entries.
 * @returns Registered handlers and context.
 */
function createExtensionHarness(branch: unknown[]): { handlers: Record<string, EventHandler>; ctx: { sessionManager: { getBranch(): unknown[] } } } {
	const handlers: Record<string, EventHandler> = {};
	const ctx = {
		sessionManager: {
			getBranch(): unknown[] {
				return branch;
			},
		},
	};
	registerAssistantThinkingStyleExtension({
		on(eventName: string, handler: EventHandler): void {
			handlers[eventName] = handler;
		},
	} as never);
	return { handlers, ctx };
}

test("tron assistant footer restores total turn time on resume", async () => {
	await initializePiThemes();
	resetAssistantMessageTimings();

	const { handlers, ctx } = createExtensionHarness([
		{ type: "message", message: { role: "user", timestamp: 1_000, content: [{ type: "text", text: "Hi" }] } },
		{ type: "message", message: { role: "assistant", timestamp: 4_000, content: [{ type: "text", text: "Done." }] } },
	]);

	try {
		await handlers.session_start?.({ reason: "resume" }, ctx as never);

		const viewport = await renderComponentInVirtualTerminal(
			() =>
				new AssistantMessageComponent(
					{
						role: "assistant",
						timestamp: 4_000,
						content: [{ type: "text", text: "Done." }],
					} as never,
					true,
				),
			80,
			8,
		);

		const plainLines = viewport.map((line) => stripAnsi(line));
		assert.ok(plainLines.some((line) => line.includes("3s")));
	} finally {
		resetAssistantMessageTimings();
	}
});
