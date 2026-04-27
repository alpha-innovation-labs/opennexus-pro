import assert from "node:assert/strict";
import test from "node:test";
import { allToolDefinitions } from "../../packages/pi-platform/src/tools.js";

test("allToolDefinitions exposes built-in Pi tool render hooks", () => {
  assert.ok(allToolDefinitions.read);
  assert.ok(allToolDefinitions.bash);
  assert.ok(allToolDefinitions.edit);
  assert.ok(allToolDefinitions.write);
});
