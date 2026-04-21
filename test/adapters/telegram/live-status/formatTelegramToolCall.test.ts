import assert from "node:assert/strict";
import test from "node:test";
import { formatTelegramToolCall } from "../../../../src/adapters/telegram/live-status/formatTelegramToolCall.js";

test("formatTelegramToolCall includes write stats and params", () => {
  assert.equal(
    formatTelegramToolCall("write", { path: "src/file.ts", content: "a\nb" }, "done"),
    "✓ write (+2 -0) — path=\"src/file.ts\", content=\"a b\"",
  );
});

test("formatTelegramToolCall includes edit stats and params", () => {
  assert.equal(
    formatTelegramToolCall("edit", { path: "src/file.ts", oldText: "a", newText: "a\nb" }, "done"),
    "✓ edit (+2 -1) — path=\"src/file.ts\", oldText=\"a\", newText=\"a b\"",
  );
});
