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

test("createTopLevelItems appends the settings leaf after command leaves", () => {
  registerSlashCommand({ name: "annotate", description: "Annotate" });
  registerSlashCommand({ name: "observations", description: "Observations" });

  const items = createTopLevelItems();
  const values = items.map((item) => item.value);

  assert.deepEqual(values.slice(-3), ["annotate", "observations", "settings"]);
});
