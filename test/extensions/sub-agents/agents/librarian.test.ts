import assert from "node:assert/strict";
import test from "node:test";
import { getLibrarianPromptText } from "../../../../packages/extensions/src/sub-agents/agents/librarian.js";

/**
 * Verifies the bundled Librarian prompt text stays read-only and lookup-focused.
 */
test("getLibrarianPromptText returns the bundled read-only Librarian prompt", () => {
  const prompt = getLibrarianPromptText();

  assert.match(prompt, /Librarian/);
  assert.match(prompt, /READ-ONLY MODE/);
  assert.match(prompt, /source-backed answers/);
  assert.match(prompt, /absolute file paths/);
  assert.match(prompt, /read tool/);
  assert.match(prompt, /grep tool/);
  assert.match(prompt, /find tool/);
});
