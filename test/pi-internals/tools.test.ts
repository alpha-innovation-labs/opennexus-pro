import assert from "node:assert/strict";
import test from "node:test";
import { allToolDefinitions } from "../../src/pi-internals/tools.js";

test("allToolDefinitions exposes built-in Pi tool render hooks", () => {
  assert.ok(allToolDefinitions.read);
  assert.ok(allToolDefinitions.bash);
  assert.ok(allToolDefinitions.edit);
  assert.ok(allToolDefinitions.write);
});
