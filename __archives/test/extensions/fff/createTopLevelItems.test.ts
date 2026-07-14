import assert from "node:assert/strict";
import test from "node:test";
import { createTopLevelItems } from "../../../packages/extension-core/src/slash-menu/createTopLevelItems.js";
import { clearRegisteredSlashCommands, registerSlashCommand } from "../../../packages/extension-core/src/slash-menu/registerSlashCommand.js";

test.beforeEach(() => {
  clearRegisteredSlashCommands();
});

test.after(() => {
  clearRegisteredSlashCommands();
});

test("createTopLevelItems groups commands and sorts labels inside each group", () => {
  registerSlashCommand({ name: "annotate", description: "Annotate", source: "extension", menuGroup: "Workspace" });
  registerSlashCommand({ name: "observations", description: "Observations", source: "extension", menuGroup: "Chat" });

  const items = createTopLevelItems();
  const chatItems = items.filter((item) => item.groupLabel === "Chat").map((item) => item.value);
  const authItems = items.filter((item) => item.groupLabel === "Auth").map((item) => item.value);

  assert.deepEqual(authItems, ["login", "logout", "model", "thinking"]);
  assert.deepEqual(chatItems, [...chatItems].sort((left, right) => left.localeCompare(right, undefined, { sensitivity: "base" })));
  assert.equal(items.find((item) => item.value === "settings")?.label, "settings");
  assert.equal(items.find((item) => item.value === "tree")?.label, "tree");
  assert.equal(items.some((item) => item.value === "scoped-models"), false);
  assert.equal(items.some((item) => item.label === "Settings"), false);
});

test("createTopLevelItems honors explicit extension command menu groups", () => {
  registerSlashCommand({ name: "aaa-extension", description: "Extension command", source: "extension", menuGroup: "Chat" });
  registerSlashCommand({ name: "aaa-mini-app", description: "Mini-app command", source: "extension", menuGroup: "Mini-Apps" });
  registerSlashCommand({ name: "zzz-general", description: "General command" });

  const items = createTopLevelItems();
  const extensionIndex = items.findIndex((item) => item.value === "aaa-extension");
  const miniAppIndex = items.findIndex((item) => item.value === "aaa-mini-app");
  const generalIndex = items.findIndex((item) => item.value === "zzz-general");

  assert.equal(items[extensionIndex]?.groupLabel, "Chat");
  assert.equal(items[miniAppIndex]?.groupLabel, "Mini-Apps");
  assert.equal(items[generalIndex]?.groupLabel, "System");
  assert.ok(generalIndex > -1 && miniAppIndex > generalIndex);
});

test("createTopLevelItems adds custom command resources and top-level prompt leaves when available", () => {
  const items = createTopLevelItems([
    { name: "prompt:review", description: "Review", source: "prompt" },
    { name: "prompt:plan", description: "Plan", source: "prompt" },
    { name: "prompt:hidden", description: "Hidden", hidden: true, source: "prompt" },
    { name: "skill:debug", description: "Debug", source: "skill" },
  ]);

  assert.equal(items.find((item) => item.value === "prompts")?.label, "custom commands");
  assert.equal(items.find((item) => item.value === "prompts")?.groupLabel, "Resources");
  assert.equal(items.find((item) => item.value === "skills")?.label, "skills");
  assert.equal(items.find((item) => item.value === "skills")?.groupLabel, "Resources");
  assert.deepEqual(
    items.filter((item) => item.groupLabel === "Custom Commands").map((item) => item.value),
    ["prompt:plan", "prompt:review"],
  );
  assert.equal(items.some((item) => item.value === "prompt:hidden"), false);
  assert.equal(items.some((item) => item.value === "skill:debug"), false);
});
