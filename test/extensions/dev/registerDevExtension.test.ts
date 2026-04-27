import assert from "node:assert/strict";
import test from "node:test";
import { registerDevExtension } from "../../../src/extensions/dev/registerDevExtension.js";

test("dev extension registers the dev-modal command", () => {
  const commands: string[] = [];
  const pi = {
    registerCommand(name: string) {
      commands.push(name);
    },
  };

  registerDevExtension(pi as never);

  assert.deepEqual(commands, ["dev-modal"]);
});
