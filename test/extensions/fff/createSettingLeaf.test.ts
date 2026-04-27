import assert from "node:assert/strict";
import test from "node:test";
import { createSettingLeaf } from "../../../packages/extensions/src/neo-editor/features/menu/createSettingLeaf.js";

test("createSettingLeaf infers toggle kind for booleans", () => {
  assert.deepEqual(createSettingLeaf("quietStartup", true), {
    kind: "toggle",
    label: "quietStartup: on",
    description: "Current value for quietStartup.",
    value: "quietStartup",
  });
});

test("createSettingLeaf preserves theme as a nested setting", () => {
  assert.deepEqual(createSettingLeaf("theme", "nexus-black"), {
    kind: "theme",
    label: "theme: nexus-black",
    description: "Current value for theme.",
    value: "theme",
  });
});

test("createSettingLeaf exposes non-boolean values dynamically", () => {
  assert.deepEqual(createSettingLeaf("editorPaddingX", 1), {
    kind: "setting",
    label: "editorPaddingX: 1",
    description: "Current value for editorPaddingX.",
    value: "editorPaddingX",
  });
});
