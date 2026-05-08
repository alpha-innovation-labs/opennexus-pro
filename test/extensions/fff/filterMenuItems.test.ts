import assert from "node:assert/strict";
import test from "node:test";
import { filterMenuItems } from "../../../packages/extensions/src/slash-menu/filterMenuItems.js";

/**
 * Verifies filtering only matches item labels and values, not descriptions.
 */
test("filterMenuItems ignores description-only matches", () => {
  const items = [
    { kind: "command", label: "/import", description: "Import and resume a session", value: "import" },
    { kind: "command", label: "/resume", description: "Resume a different session", value: "resume" },
  ] as const;

  const results = filterMenuItems([...items], "resume");

  assert.deepEqual(results.map((item) => item.value), ["resume"]);
});

/**
 * Verifies grouped filtering does not split a group into repeated headings.
 */
test("filterMenuItems preserves group order before score ordering", () => {
  const items = [
    { kind: "command", label: "model", description: "Select model", groupLabel: "General", value: "model" },
    { kind: "command", label: "scoped-models", description: "Enable models", groupLabel: "General", value: "scoped-models" },
    { kind: "command", label: "dev-modal", description: "Open modal", groupLabel: "Extensions", value: "dev-modal" },
    { kind: "command", label: "logout", description: "Remove provider authentication", groupLabel: "General", value: "logout" },
  ] as const;

  const results = filterMenuItems([...items], "mo");

  assert.deepEqual(results.map((item) => item.value), ["model", "scoped-models", "dev-modal"]);
});
