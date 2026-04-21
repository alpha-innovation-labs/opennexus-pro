import assert from "node:assert/strict";
import test from "node:test";
import { extractAssistantTextFromJsonEvents } from "../../../src/adapters/telegram/runtime/extractAssistantTextFromJsonEvents.js";

test("extractAssistantTextFromJsonEvents reads the final assistant text from agent_end", () => {
  const text = extractAssistantTextFromJsonEvents([
    JSON.stringify({ type: "session", id: "a" }),
    JSON.stringify({
      type: "agent_end",
      messages: [
        { role: "user", content: [{ type: "text", text: "hi" }] },
        { role: "assistant", content: [{ type: "text", text: "hello there" }] },
      ],
    }),
  ]);

  assert.equal(text, "hello there");
});
