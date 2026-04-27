import assert from "node:assert/strict";
import test from "node:test";
import { resolveTriggerSessionStart } from "../../../packages/extensions/src/neo-editor/features/promptline/trigger/resolveTriggerSessionStart.js";

test("resolveTriggerSessionStart starts slash only from an empty editor", () => {
  assert.deepEqual(resolveTriggerSessionStart("/", "", ""), { kind: "slash", prefix: "/" });
  assert.equal(resolveTriggerSessionStart("/", "hello ", "hello "), null);
});

test("resolveTriggerSessionStart starts at after whitespace in existing text", () => {
  assert.deepEqual(resolveTriggerSessionStart("@", "hello ", "hello "), { kind: "at", prefix: "@" });
});

test("resolveTriggerSessionStart does not start at in the middle of a word", () => {
  assert.equal(resolveTriggerSessionStart("@", "hello", "hello"), null);
});
