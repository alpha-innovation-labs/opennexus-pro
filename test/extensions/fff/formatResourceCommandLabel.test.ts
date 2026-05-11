import assert from "node:assert/strict";
import test from "node:test";
import { formatResourceCommandLabel } from "../../../packages/extension-core/src/slash-menu/formatResourceCommandLabel.js";

test("formatResourceCommandLabel uses local and global icons", () => {
  assert.equal(formatResourceCommandLabel("›", { kind: "command", label: "prompt:local", value: "prompt:local", description: "", sourceScope: "project" }), "›  prompt:local");
  assert.equal(formatResourceCommandLabel("›", { kind: "command", label: "prompt:global", value: "prompt:global", description: "", sourceScope: "user" }), "›  prompt:global");
});

test("formatResourceCommandLabel hides the skill namespace in labels", () => {
  assert.equal(formatResourceCommandLabel("›", { kind: "command", label: "skill:local", value: "skill:local", description: "", sourceScope: "project" }), "›  local");
  assert.equal(formatResourceCommandLabel("›", { kind: "command", label: "skill:global", value: "skill:global", description: "", sourceScope: "user" }), "›  global");
});
