import assert from "node:assert/strict";
import test from "node:test";
import { registerDevExtension } from "../../../packages/extensions/src/dev/registerDevExtension.js";

test("dev extension registers dev-only commands", () => {
  const commands: string[] = [];
  const pi = {
    registerCommand(name: string) {
      commands.push(name);
    },
  };

  registerDevExtension(pi as never);

  assert.deepEqual(commands, ["dev-modal", "telemetry"]);
});
