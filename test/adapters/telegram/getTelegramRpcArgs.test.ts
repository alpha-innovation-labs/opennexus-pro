import assert from "node:assert/strict";
import test from "node:test";
import { getTelegramRpcArgs } from "../../../packages/mini-apps/src/social-chat/adapters/telegram/rpc/getTelegramRpcArgs.js";
import { getTelegramChatSessionDir } from "../../../packages/mini-apps/src/social-chat/adapters/telegram/session/getTelegramChatSessionDir.js";

test("getTelegramRpcArgs disables extensions for the child nexus process", () => {
  const args = getTelegramRpcArgs(42);

  assert.deepEqual(args, [
    "--no-extensions",
    "--mode",
    "rpc",
    "--session-dir",
    getTelegramChatSessionDir(42),
    "--continue",
  ]);
});
