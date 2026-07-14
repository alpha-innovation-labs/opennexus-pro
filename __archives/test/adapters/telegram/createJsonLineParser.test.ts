import assert from "node:assert/strict";
import test from "node:test";
import { createJsonLineParser } from "../../../packages/mini-apps/src/social-chat/adapters/telegram/rpc/createJsonLineParser.js";

test("createJsonLineParser emits complete JSON lines across chunks", () => {
  const values: unknown[] = [];
  const parser = createJsonLineParser((value) => {
    values.push(value);
  });

  parser.push('{"a":1}\n{"b":');
  parser.push('2}\n');

  assert.deepEqual(values, [{ a: 1 }, { b: 2 }]);
});
