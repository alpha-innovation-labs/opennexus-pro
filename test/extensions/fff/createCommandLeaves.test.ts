import assert from "node:assert/strict";
import test from "node:test";
import { createCommandLeaves } from "../../../src/extensions/neo-editor/features/menu/createCommandLeaves.js";
import { clearRegisteredSlashCommands, registerSlashCommand } from "../../../src/extensions/neo-editor/features/menu/registerSlashCommand.js";

test.beforeEach(() => {
  clearRegisteredSlashCommands();
});

test.after(() => {
  clearRegisteredSlashCommands();
});

test("createCommandLeaves excludes removed fff-features command", () => {
  registerSlashCommand({ name: "annotate", description: "Annotate" });
  registerSlashCommand({ name: "fff-features", description: "Old command" });

  const leaves = createCommandLeaves();

  assert.ok(leaves.some((leaf) => leaf.value === "annotate"));
  assert.ok(!leaves.some((leaf) => leaf.value === "fff-features"));
});
