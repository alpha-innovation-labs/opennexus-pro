import assert from "node:assert/strict";
import test from "node:test";
import { clearRegisteredSlashCommands, registerSlashCommand } from "../../../packages/extensions/src/neo-editor/features/menu/registerSlashCommand.js";
import { createCommandLeaves } from "../../../packages/extensions/src/neo-editor/features/menu/createCommandLeaves.js";

/**
 * Keeps internal Nexus selector commands out of the visible slash menu.
 */
test("createCommandLeaves hides internal Nexus selector commands", () => {
  clearRegisteredSlashCommands();
  registerSlashCommand({ name: "nexus-model-select", hidden: true, source: "extension" });

  const leaves = createCommandLeaves();

  assert.equal(leaves.some((leaf) => leaf.value === "nexus-model-select"), false);
  clearRegisteredSlashCommands();
});
