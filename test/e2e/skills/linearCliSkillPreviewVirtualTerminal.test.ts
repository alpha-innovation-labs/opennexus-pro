import assert from "node:assert/strict";
import { resolve } from "node:path";
import stripAnsi from "strip-ansi";
import test from "node:test";
import { SlashMenuModal } from "../../../packages/extensions/src/slash-menu/SlashMenuModal.js";
import { renderComponentInVirtualTerminal } from "../../support/render/renderComponentInVirtualTerminal.js";
import { createTestTheme } from "../../support/theme/createTestTheme.js";

/** Creates the minimum slash-menu context for /skills preview rendering. */
function createContext() {
  return {
    cwd: process.cwd(),
    ui: { theme: createTestTheme(), notify: () => undefined },
    model: { provider: "anthropic", id: "claude-3" },
    modelRegistry: { getAvailable: () => [], authStorage: { get: () => undefined, hasAuth: () => false, list: () => [] } },
    sessionManager: { getEntries: () => [], getSessionDir: () => ".pi/agent/sessions", getTree: () => [] },
  };
}

test("/skills linear-cli preview matches lazy skills line-numbered markdown in wterm", async () => {
  const originalRows = process.stdout.rows;
  Object.defineProperty(process.stdout, "rows", { configurable: true, value: 50 });
  const sourcePath = resolve(".agents/skills/linear-cli/SKILL.md");
  const commands = () => [
    {
      name: "skill:linear-cli",
      description: "Manage Linear issues from the command line using the linear cli.",
      source: "skill",
      sourceInfo: { scope: "project", source: "project", origin: "top-level", path: sourcePath },
    },
  ] as never;
  try {
    const modal = new SlashMenuModal(createContext() as never, () => "medium", () => undefined, () => undefined, () => undefined, () => undefined, commands);

    modal.setQuery("skills");
    await modal.refresh();
    modal.handleInput("\r");
    await Promise.resolve();
    const viewport = await renderComponentInVirtualTerminal(() => modal, 120, 50);
    const output = viewport.join("\n");
    const plainOutput = stripAnsi(output);

    assert.match(plainOutput, /Skills/u);
    assert.match(plainOutput, /linear-cli/u);
    assert.match(plainOutput, /\s+1 │ ▶ .*frontmatter/u);
    assert.match(plainOutput, /\s+3 │ description: Manage Linear issues/u);
    assert.match(plainOutput, /\s+7 │\s+① Linear CLI/u);
    assert.match(plainOutput, /\s+13 │ The\s+linear\s+command/u);
    assert.match(plainOutput, /\s+16 │ │ linear --version/u);
    assert.doesNotMatch(plainOutput, /\s+16 │ The\s+linear\s+command/u);
    assert.doesNotMatch(plainOutput, /\s+1 ┊/u);
  } finally {
    Object.defineProperty(process.stdout, "rows", { configurable: true, value: originalRows });
  }
});
