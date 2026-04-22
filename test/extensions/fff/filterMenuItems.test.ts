import assert from "node:assert/strict";
import test from "node:test";
import { filterMenuItems } from "../../../src/extensions/shared/slash-menu/filterMenuItems.js";

/**
 * Verifies exact slash-command matches outrank description-only matches.
 */
test("filterMenuItems prefers exact command matches over description matches", () => {
  const items = [
    { kind: "command", label: "/import", description: "Import and resume a session", value: "import" },
    { kind: "command", label: "/resume", description: "Resume a different session", value: "resume" },
  ] as const;

  const results = filterMenuItems([...items], "resume");

  assert.equal(results[0]?.value, "resume");
});
