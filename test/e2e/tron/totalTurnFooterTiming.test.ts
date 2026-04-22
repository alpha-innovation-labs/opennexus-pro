import assert from "node:assert/strict";
import test from "node:test";
import { AssistantMessageComponent } from "../../../node_modules/@mariozechner/pi-coding-agent/dist/modes/interactive/components/assistant-message.js";
import registerAssistantThinkingStyleExtension from "../../../src/extensions/tron/thinking/registerAssistantThinkingStyleExtension.ts";
import { resetAssistantMessageTimings } from "../../../src/extensions/tron/thinking/assistantMessageTimingState.js";
import { renderComponentInVirtualTerminal } from "../../support/render/renderComponentInVirtualTerminal.js";
import { initializePiThemes } from "../../support/theme/initializePiThemes.js";

type ExtensionHandler = (event: { message?: { role: string; timestamp?: number } }, ctx?: unknown) => Promise<void>;

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
 * Creates a minimal extension API harness for timing event tests.
 *
 * @returns Registered handlers and a minimal session context.
 */
function createExtensionHarness(): { handlers: Record<string, ExtensionHandler>; ctx: { sessionManager: { getBranch(): unknown[] } } } {
	const handlers: Record<string, ExtensionHandler> = {};
	const ctx = {
		sessionManager: {
			getBranch(): unknown[] {
				return [];
			},
		},
	};
	registerAssistantThinkingStyleExtension({
		on(eventName: string, handler: ExtensionHandler): void {
			handlers[eventName] = handler;
		},
	} as never);
	return { handlers, ctx };
}

test("tron assistant footer shows total turn time from user message to final assistant message", async () => {
	await initializePiThemes();
	resetAssistantMessageTimings();

	const { handlers, ctx } = createExtensionHarness();
	const originalNow = Date.now;
	let now = 0;
	Date.now = () => now;

	try {
		await handlers.session_start?.({ message: { role: "system" } }, ctx as never);

		await handlers.message_end?.({ message: { role: "user", timestamp: 1_000 } });
		now = 3_000;
		await handlers.message_start?.({ message: { role: "assistant" } });
		now = 5_000;
		await handlers.message_end?.({ message: { role: "assistant", timestamp: 5_000 } });
		await handlers.turn_end?.({ message: { role: "assistant", timestamp: 5_000 } });

		const viewport = await renderComponentInVirtualTerminal(
			() =>
				new AssistantMessageComponent(
					{
						role: "assistant",
						timestamp: 5_000,
						content: [{ type: "text", text: "Done." }],
					} as never,
					true,
				),
			80,
			8,
		);

		const plainLines = viewport.map((line) => stripAnsi(line));
		assert.ok(plainLines.some((line) => line.includes("4s")));
	} finally {
		Date.now = originalNow;
		resetAssistantMessageTimings();
	}
});
