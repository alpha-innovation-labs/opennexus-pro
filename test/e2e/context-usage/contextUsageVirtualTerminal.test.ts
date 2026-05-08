import assert from "node:assert/strict";
import test from "node:test";
import type { Component } from "@mariozechner/pi-tui";
import { ContextUsageModal } from "../../../packages/extensions/src/context-usage/ContextUsageModal.js";
import type { ContextUsageReport } from "../../../packages/extensions/src/context-usage/types.js";
import { renderComponentInVirtualTerminal } from "../../support/render/renderComponentInVirtualTerminal.js";
import { createTestTheme } from "../../support/theme/createTestTheme.js";

/**
 * Creates a deterministic context usage report fixture.
 *
 * @returns Context usage report fixture.
 */
function createReport(): ContextUsageReport {
  return {
    title: "Context Usage",
    modelName: "MiniMax-M2.7",
    usedTokens: 27500,
    contextWindow: 200000,
    usedPercent: 13.75,
    categories: [
      { marker: "⛁", label: "System prompt", tokens: 6400, percent: 3.2 },
      { marker: "⛁", label: "System tools", tokens: 15900, percent: 7.95 },
      { marker: "⛁", label: "MCP tools", tokens: 3600, percent: 1.8 },
      { marker: "⛁", label: "AGENTS.md", tokens: 262, percent: 0.13 },
      { marker: "⛁", label: "Skills", tokens: 548, percent: 0.27 },
      { marker: "⛁", label: "Messages", tokens: 818, percent: 0.41 },
      { marker: "⛶", label: "Free space", tokens: 156116, percent: 78.06 },
      { marker: "⛝", label: "Autocompact buffer", tokens: 16384, percent: 8.19 },
    ],
    systemTools: [{ label: "read", tokens: 151 }, { label: "todo", tokens: 80 }],
    mcpTools: [{ label: "mcp__playwright__browser_click", tokens: 208 }],
    agentsFiles: [{ label: "/repo/AGENTS.md", tokens: 262 }],
    skills: [{ label: "agent-browser", tokens: 126 }],
  };
}

/**
 * Creates a static component for rendering context usage text.
 *
 * @returns Static text component.
 */
function createContextUsageComponent(): Component {
  return new ContextUsageModal(createTestTheme(), createReport(), () => undefined);
}

test("/context renders all usage sections in the virtual terminal", async () => {
  const viewport = await renderComponentInVirtualTerminal(() => createContextUsageComponent(), 120, 50);
  const output = viewport.join("\n");

  assert.match(output, /Context Usage/u);
  assert.match(output, /MiniMax-M2\.7/u);
  assert.match(output, /MiniMax-M2\.7.*27\.5k\/200k tokens \(13\.8%\)/u);
  assert.match(output, /MiniMax-M2\.7[^\n]*\n│\s*│\n│.*Estimated usage by category/u);
  assert.match(output, /├─ ⛁ System prompt/u);
  assert.match(output, /System tools/u);
  assert.match(output, /├─ read: 151 tokens/u);
  assert.match(output, /└─ todo: 80 tokens/u);
  assert.match(output, /MCP tools · \/mcp/u);
  assert.match(output, /└─ mcp__playwright__browser_click: 208 tokens/u);
  assert.match(output, /AGENTS.md/u);
  assert.doesNotMatch(output, /loaded by Pi/u);
  assert.match(output, /\/repo\/AGENTS.md: 262 tokens/u);
  assert.match(output, /Skills · \/skills/u);
  assert.match(output, /└─ agent-browser: 126 tokens/u);
});
