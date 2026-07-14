import assert from "node:assert/strict";
import test from "node:test";
import { formatTelegramToolCall } from "../../../../packages/mini-apps/src/social-chat/adapters/telegram/live-status/formatTelegramToolCall.js";

test("formatTelegramToolCall includes write stats and params", () => {
  assert.equal(
    formatTelegramToolCall("write", { path: "src/file.ts", content: "a\nb" }, "done"),
    "✓ write — path=\"src/file.ts\", content=\"a b\"\n    +2 -0",
  );
});

test("formatTelegramToolCall includes edit stats and params", () => {
  assert.equal(
    formatTelegramToolCall("edit", { path: "src/file.ts", oldText: "a", newText: "a\nb" }, "done"),
    "✓ edit — path=\"src/file.ts\", oldText=\"a\", newText=\"a b\"\n    +2 -1",
  );
});
