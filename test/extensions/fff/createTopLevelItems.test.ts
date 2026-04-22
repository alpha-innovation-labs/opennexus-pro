import assert from "node:assert/strict";
import test from "node:test";
import { createTopLevelItems } from "../../../src/extensions/shared/slash-menu/createTopLevelItems.js";
import { clearRegisteredSlashCommands, registerSlashCommand } from "../../../src/extensions/shared/slash-menu/registerSlashCommand.js";

test.beforeEach(() => {
  clearRegisteredSlashCommands();
});

test.after(() => {
  clearRegisteredSlashCommands();
});

test("createTopLevelItems includes registered commands dynamically plus settings", () => {
  registerSlashCommand({ name: "annotate", description: "Annotate" });
  registerSlashCommand({ name: "observations", description: "Observations" });

  const items = createTopLevelItems();

  assert.ok(items.some((item) => item.value === "annotate"));
  assert.ok(items.some((item) => item.value === "observations"));
  assert.ok(items.some((item) => item.value === "settings"));
});
