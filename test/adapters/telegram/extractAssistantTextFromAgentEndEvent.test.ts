import assert from "node:assert/strict";
import test from "node:test";
import { extractAssistantTextFromAgentEndEvent } from "../../../packages/social-adapters/src/telegram/runtime/extractAssistantTextFromAgentEndEvent.js";

test("extractAssistantTextFromAgentEndEvent reads the final assistant text", () => {
  assert.equal(
    extractAssistantTextFromAgentEndEvent({
      type: "agent_end",
      messages: [
        { role: "user", content: [{ type: "text", text: "hi" }] },
        { role: "assistant", content: [{ type: "text", text: "hello" }] },
      ],
    }),
    "hello",
  );
});
