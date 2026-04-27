import assert from "node:assert/strict";
import test from "node:test";
import { clearTelegramRpcSession } from "../../../packages/social-adapters/src/telegram/rpc/clearTelegramRpcSession.js";
import { getTelegramRpcSession } from "../../../packages/social-adapters/src/telegram/rpc/getTelegramRpcSession.js";
import { resetTelegramRpcSession } from "../../../packages/social-adapters/src/telegram/rpc/resetTelegramRpcSession.js";
import { sendTelegramRpcPrompt } from "../../../packages/social-adapters/src/telegram/rpc/sendTelegramRpcPrompt.js";
import { setTelegramRpcSession } from "../../../packages/social-adapters/src/telegram/rpc/setTelegramRpcSession.js";
import type { TelegramRpcSession } from "../../../packages/social-adapters/src/telegram/rpc/types.js";

/**
 * Creates a fake Telegram RPC session for timeout and registry tests.
 *
 * @param chatId Telegram chat id.
 * @param writes Captures stdin writes.
 * @param killSignals Captures child-process kill signals.
 * @returns Fake session state.
 */
function createFakeTelegramRpcSession(
  chatId: number,
  writes: string[],
  killSignals: string[],
): TelegramRpcSession {
  const child = {
    exitCode: null,
    killed: false,
    kill(signal?: NodeJS.Signals) {
      child.killed = true;
      killSignals.push(signal ?? "SIGTERM");
      return true;
    },
    stdin: {
      write(chunk: string) {
        writes.push(chunk);
        return true;
      },
    },
  };

  return {
    child: child as never,
    chatId,
    queue: Promise.resolve(),
    stderr: "",
  };
}

test("sendTelegramRpcPrompt resets timed out sessions", async () => {
  const writes: string[] = [];
  const killSignals: string[] = [];
  const session = createFakeTelegramRpcSession(42, writes, killSignals);
  setTelegramRpcSession(42, session);

  await assert.rejects(
    sendTelegramRpcPrompt(session, "hello", undefined, {
      resetSession: resetTelegramRpcSession,
      timeoutMs: 0,
    }),
    /Telegram RPC prompt timed out/,
  );

  assert.equal(getTelegramRpcSession(42), undefined);
  assert.equal(session.currentRequest, undefined);
  assert.deepEqual(killSignals, ["SIGTERM"]);
  assert.match(writes[0] ?? "", /"type":"prompt"/);
  assert.match(writes[0] ?? "", /"message":"hello"/);
});

test("clearTelegramRpcSession keeps replacement sessions registered", () => {
  const writes: string[] = [];
  const killSignals: string[] = [];
  const staleSession = createFakeTelegramRpcSession(7, writes, killSignals);
  const replacementSession = createFakeTelegramRpcSession(7, writes, killSignals);

  setTelegramRpcSession(7, staleSession);
  setTelegramRpcSession(7, replacementSession);

  clearTelegramRpcSession(7, staleSession);
  assert.equal(getTelegramRpcSession(7), replacementSession);

  clearTelegramRpcSession(7, replacementSession);
  assert.equal(getTelegramRpcSession(7), undefined);
});
