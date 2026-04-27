import assert from "node:assert/strict";
import test from "node:test";
import { createCommandLeaves } from "../../../src/extensions/neo-editor/features/menu/createCommandLeaves.js";
import { clearRegisteredSlashCommands, registerSlashCommand } from "../../../src/extensions/neo-editor/features/menu/registerSlashCommand.js";

const expectedBuiltinCommands = [
  "settings",
  "model",
  "scoped-models",
  "export",
  "import",
  "share",
  "copy",
  "name",
  "session",
  "changelog",
  "hotkeys",
  "fork",
  "tree",
  "login",
  "logout",
  "new",
  "compact",
  "resume",
  "reload",
  "quit",
];

/**
 * Resets the local command registry between tests.
 */
function resetSlashCommands(): void {
  clearRegisteredSlashCommands();
}

test.beforeEach(resetSlashCommands);
test.after(resetSlashCommands);

test("createCommandLeaves includes the full built-in Pi command baseline", () => {
  const leaves = createCommandLeaves();
  const names = leaves.map((leaf) => leaf.value);

  assert.deepEqual(names.filter((name) => expectedBuiltinCommands.includes(name)).sort(), [...expectedBuiltinCommands].sort());
});

test("createCommandLeaves keeps built-in /fork visible alongside extension commands", () => {
  registerSlashCommand({ name: "annotate", description: "Annotate" });

  const leaves = createCommandLeaves();

  assert.ok(leaves.some((leaf) => leaf.value === "fork"));
  assert.ok(leaves.some((leaf) => leaf.value === "annotate"));
});
