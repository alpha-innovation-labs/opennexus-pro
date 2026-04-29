import assert from "node:assert/strict";
import test from "node:test";
import { handleTelegramRpcEvent } from "../../../packages/social-adapters/src/telegram/rpc/handleTelegramRpcEvent.js";
import type { TelegramRpcSession } from "../../../packages/social-adapters/src/telegram/rpc/types.js";

/**
 * Creates a fake session with one active request.
 *
 * @returns Fake session and captured result promises.
 */
function createSessionWithRequest(): {
	rejected: Promise<Error>;
	resolved: Promise<string>;
	session: TelegramRpcSession;
} {
	let rejectRequest!: (error: Error) => void;
	let resolveRequest!: (text: string) => void;
	const rejected = new Promise<Error>((resolve) => {
		rejectRequest = resolve;
	});
	const resolved = new Promise<string>((resolve) => {
		resolveRequest = resolve;
	});
	const timeout = setTimeout(() => undefined, 60_000);
	const session = {
		child: {} as never,
		chatId: 42,
		currentRequest: {
			requestId: "request-1",
			resolve: resolveRequest,
			reject: rejectRequest,
			timeout,
		},
		queue: Promise.resolve(),
		stderr: "",
	} satisfies TelegramRpcSession;

	return { rejected, resolved, session };
}

test("handleTelegramRpcEvent rejects empty agent_end without throwing", async () => {
	const { rejected, session } = createSessionWithRequest();

	assert.doesNotThrow(() => handleTelegramRpcEvent(session, { type: "agent_end", messages: [] }));

	const error = await rejected;
	assert.equal(session.currentRequest, undefined);
	assert.match(error.message, /did not produce a final assistant message/);
});

test("handleTelegramRpcEvent resolves agent_end with final assistant text", async () => {
	const { resolved, session } = createSessionWithRequest();

	handleTelegramRpcEvent(session, {
		type: "agent_end",
		messages: [{ role: "assistant", content: [{ type: "text", text: "done" }] }],
	});

	assert.equal(await resolved, "done");
	assert.equal(session.currentRequest, undefined);
});
