import assert from "node:assert/strict";
import test from "node:test";
import { LinesComponent } from "../../support/component/LinesComponent.js";
import { renderComponentInVirtualTerminal } from "../../support/render/renderComponentInVirtualTerminal.js";
import { AgentWidget, type AgentActivity, type Theme } from "../../../packages/extension-core/src/sub-agents/ui/agent-widget.js";
import { createAgentActivityTracker } from "../../../packages/extension-core/src/sub-agents/ui/createAgentActivityTracker.js";
import type { AgentRecord } from "../../../packages/extension-core/src/sub-agents/types.js";

/**
 * Creates a fake agent manager for widget rendering tests.
 *
 * @param agents Agent records to expose.
 * @returns Minimal manager-like object.
 */
function createManager(agents: AgentRecord[]): { listAgents(): AgentRecord[] } {
  return {
    listAgents(): AgentRecord[] {
      return agents;
    },
  };
}

/**
 * Creates a no-op theme for direct widget rendering.
 *
 * @returns Theme passthrough helpers.
 */
function createTheme(): Theme {
  return {
    fg(_color: string, text: string): string {
      return text;
    },
    bold(text: string): string {
      return text;
    },
  };
}

test("subagent widget shows live tool output in a single line with compact token counts", async () => {
  const startedAt = Date.now() - 14_400;
  const agents: AgentRecord[] = [
    {
      id: "agent-1",
      type: "Explore",
      description: "Scan 3 random files",
      status: "running",
      toolUses: 0,
      startedAt,
    },
    {
      id: "agent-2",
      type: "Explore",
      description: "Queued scan",
      status: "queued",
      toolUses: 0,
      startedAt: startedAt - 1_000,
    },
  ];

  const { state, callbacks } = createAgentActivityTracker();
  callbacks.onSessionCreated({
    getSessionStats(): { tokens: { total: number } } {
      return { tokens: { total: 5234 } };
    },
  } as never);
  callbacks.onToolActivity({
    type: "start",
    toolCallId: "tool-1",
    toolName: "read",
    args: { path: "src/index.ts" },
  });
  callbacks.onToolActivity({
    type: "update",
    toolCallId: "tool-1",
    toolName: "read",
    outputText: "I sampled these 3 files at random:",
  });
  for (let index = 0; index < 5; index += 1) {
    callbacks.onToolActivity({
      type: "end",
      toolCallId: `completed-${index}`,
      toolName: "read",
    });
  }
  const activity = new Map<string, AgentActivity>([["agent-1", state]]);

  const widget = new AgentWidget(createManager(agents) as never, activity);
  const viewport = await renderComponentInVirtualTerminal(
    () => new LinesComponent((width) => (widget as any).renderWidget({ terminal: { columns: width } }, createTheme())),
    120,
    8,
  );

  const output = viewport.join("\n");
  assert.match(output, /● Agents/);
  assert.match(output, /Agent|Explore/);
  assert.match(output, /󰈙 read I sampled these 3 files at random:/);
  assert.match(output, /5\.2k · 14\.4s/);
  assert.doesNotMatch(output, /⎿/);
  assert.match(output, /1 queued/);
});
