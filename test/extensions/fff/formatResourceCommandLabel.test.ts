import assert from "node:assert/strict";
import test from "node:test";
import { formatResourceCommandLabel } from "../../../packages/extensions/src/neo-editor/features/menu/formatResourceCommandLabel.js";

test("formatResourceCommandLabel uses local and global icons", () => {
  assert.equal(formatResourceCommandLabel("›", { kind: "command", label: "skill:local", value: "skill:local", description: "", sourceScope: "project" }), "›  skill:local");
  assert.equal(formatResourceCommandLabel("›", { kind: "command", label: "skill:global", value: "skill:global", description: "", sourceScope: "user" }), "›  skill:global");
});
