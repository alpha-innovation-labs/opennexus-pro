import assert from "node:assert/strict";
import test from "node:test";
import { createUserMessageMetadataQueueFromSession } from "../../../packages/extensions/src/tron/user-message/metadata/createUserMessageMetadataQueueFromSession.js";

const userMessage = {
  role: "user",
  content: [{ type: "text", text: "Plan the refactor" }],
  timestamp: 1776206040000,
};

test("tron builds user message timestamp metadata from the active session branch", () => {
  const queue = createUserMessageMetadataQueueFromSession({
    sessionManager: {
      getLeafId: () => "user-1",
      getBranch: () => [
        { id: "user-1", type: "message", message: userMessage, timestamp: "2026-04-14T22:34:00.000Z" },
      ],
      buildSessionContext: () => ({ messages: [userMessage] }),
    },
  } as any);

  assert.deepEqual(queue, [{ timestamp: 1776206040000 }]);
});
