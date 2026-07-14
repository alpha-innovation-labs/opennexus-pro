import assert from "node:assert/strict";
import test from "node:test";
import { createCommandLeaves } from "../../../packages/extension-core/src/slash-menu/createCommandLeaves.js";
import { clearRegisteredSlashCommands, registerSlashCommand } from "../../../packages/extension-core/src/slash-menu/registerSlashCommand.js";

const expectedBuiltinCommands = [
  "model",
  "export",
  "import",
  "share",
  "copy",
  "name",
  "session",
  "hotkeys",
  "fork",
  "login",
  "logout",
  "new",
  "compact",
  "resume",
  "reload",
];

/**
 * Resets the local command registry between tests.
 */
function resetSlashCommands(): void {
  clearRegisteredSlashCommands();
}

test.beforeEach(resetSlashCommands);
test.after(resetSlashCommands);

test("createCommandLeaves includes the visible built-in Pi command baseline", () => {
  const leaves = createCommandLeaves();
  const names = leaves.map((leaf) => leaf.value);

  assert.deepEqual(names.filter((name) => expectedBuiltinCommands.includes(name)).sort(), [...expectedBuiltinCommands].sort());
  assert.equal(names.includes("scoped-models"), false);
});

test("createCommandLeaves keeps built-in /fork visible alongside extension commands", () => {
  registerSlashCommand({ name: "annotate", description: "Annotate" });

  const leaves = createCommandLeaves();

  assert.ok(leaves.some((leaf) => leaf.value === "fork"));
  assert.ok(leaves.some((leaf) => leaf.value === "annotate"));
});
