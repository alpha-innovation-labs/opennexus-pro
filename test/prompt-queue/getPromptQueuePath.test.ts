import assert from "node:assert/strict";
import test from "node:test";
import { getPromptQueuePath } from "../../packages/extensions/src/prompt-queue/getPromptQueuePath.js";

test("prompt queue path is scoped by session id", () => {
  const alphaPath = getPromptQueuePath("session-alpha");
  const betaPath = getPromptQueuePath("session-beta");

  assert.match(alphaPath, /session-alpha\.json$/u);
  assert.match(betaPath, /session-beta\.json$/u);
  assert.notEqual(alphaPath, betaPath);
});

test("prompt queue path rejects empty session ids", () => {
  assert.throws(() => getPromptQueuePath(""), /session id/u);
});
