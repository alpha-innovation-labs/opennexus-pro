import type { ExtensionAPI, Theme, ToolDefinition } from "@earendil-works/pi-coding-agent";
import { stripTerminalSequences, visibleWidth } from "@earendil-works/pi-tui";
import { beforeAll, describe, expect, it, vi } from "vitest";
import tintin from "../../packages/extension-core/subagent-tintin/src/index";
import { renderWorkflowToolResult } from "../../packages/extension-core/subagent-tintin/src/ui/workflow-tool-result";
import type { WorkflowCardInput } from "../../packages/extension-core/subagent-tintin/src/ui/workflow-card";
import { createCompactToolDefinition } from "../../packages/extension-core/tron/src/compact-tool-lines/createCompactToolDefinition";
import { toolCallFrameSyncedIds, toolCallTopBorderIds, toolCallBottomBorderIds } from "../../packages/extension-core/tron/src/activity/state";
import { collapsedToolGroupLeaderByToolCallId } from "../../packages/extension-core/tron/src/collapsedToolGroupState";

vi.mock("../../packages/extension-core/subagent-tintin/src/custom-agents", () => ({ loadCustomAgents: () => [] }));
vi.mock("../../packages/extension-core/subagent-tintin/src/settings", () => ({
  loadSettings: () => ({}), applyAndEmitLoaded: vi.fn(), saveAndEmitChanged: vi.fn(),
}));

const theme = {
  fg: (_: string, text: string) => text, bg: (_: string, text: string) => text,
  bold: (text: string) => text, italic: (text: string) => text, getBgAnsi: () => "",
} as unknown as Theme;
const tools = new Map<string, ToolDefinition>();
const context = (id = "agent", expanded = false, isError = false) => ({
  toolCallId: id, expanded, isError, isPartial: false, args: {}, state: {},
  invalidate: vi.fn(), executionStarted: true, argsComplete: true, cwd: process.cwd(),
} as any);
const result = (status?: string) => ({
  content: [{ type: "text" as const, text: "Stored result detail" }],
  details: status ? { status, displayName: "Explore", description: "Inspect renderer", subagentType: "Explore", toolUses: 2, tokens: "100 tokens", durationMs: 1200, agentId: "a1", activity: "reading file", error: "worker failed" } : undefined,
});
const text = (component: any, width = 100) => component.render(width).map(stripTerminalSequences).join("\n");

beforeAll(() => {
  (globalThis as any)[Symbol.for("@earendil-works/pi-coding-agent:theme")] = theme;
  const noop = vi.fn();
  tintin({
    registerTool: (tool: ToolDefinition) => tools.set(tool.name, tool),
    registerCommand: noop, registerShortcut: noop, registerFlag: noop,
    registerMessageRenderer: noop, registerEntryRenderer: noop, on: noop,
    events: { on: () => noop, emit: noop },
  } as unknown as ExtensionAPI);
});

function wrapped(name = "Agent") { return createCompactToolDefinition(tools.get(name)!) as any; }

describe("Tron Tintin rendering", () => {
  it("preserves execution and schema references and semantic call identity/task", () => {
    const tool = wrapped();
    expect(tool.execute).toBe(tools.get("Agent")!.execute);
    expect(tool.parameters).toBe(tools.get("Agent")!.parameters);
    const call = text(tool.renderCall({ subagent_type: "Explore", description: "Inspect renderer" }, theme, context()));
    expect(call).toContain("Explore");
    expect(call).toContain("Inspect renderer");
    expect(call).toContain("┌");
    expect(call).not.toContain("└");
  });

  it.each([
    ["queued", "Queued"], ["running", "reading file"], ["background", "Running in background"],
    ["completed", "Done"], ["steered", "turn limit"], ["stopped", "Stopped"],
    ["aborted", "Aborted"], ["error", "worker failed"],
  ])("keeps %s visible when collapsed", (status, expected) => {
    const output = text(wrapped().renderResult(result(status), { expanded: false, isPartial: status === "queued" }, theme, context()));
    expect(output).toContain(expected);
    expect(output).toContain("│");
    expect(output).toContain("└");
    if (status === "background") expect(output).not.toContain("Done");
  });

  it.each([false, true])("retains missing-details/pre-execution errors (expanded=%s)", (expanded) => {
    for (const name of ["Agent", "SubagentWorkflow"]) {
      for (const error of [false, true]) {
        const output = text(wrapped(name).renderResult(result(), { expanded }, theme, context(name, expanded, error)));
        expect(output).toContain("Stored result detail");
      }
    }
  });

  it.each(["completed", "steered", "stopped", "aborted", "error", "background"])("retains expanded %s result details", (status) => {
    expect(text(wrapped().renderResult(result(status), { expanded: true }, theme, context()))).toContain("Stored result detail");
  });

  it("does not fabricate missing duration or usage", () => {
    const output = text(wrapped().renderResult({ content: [], details: { status: "completed" } }, { expanded: false }, theme, context()));
    expect(output).toContain("Done");
    expect(output).not.toMatch(/NaN|undefined|tokens|tool uses/);
  });

  it("invalidates the actual upstream child and forwards row state/invalidation", () => {
    const child = { render: () => ["live"], invalidate: vi.fn() };
    const ctx = context();
    const renderResult = vi.fn((_result, _options, _theme, innerContext) => {
      expect(innerContext.state).toBe(ctx.state);
      expect(innerContext.invalidate).toBe(ctx.invalidate);
      return child;
    });
    const tool = createCompactToolDefinition({ ...tools.get("Agent")!, renderResult }) as any;
    const component = tool.renderResult(result("running"), { expanded: false }, theme, ctx);
    component.render(80); component.invalidate(); component.render(80);
    expect(child.invalidate).toHaveBeenCalledOnce();
    expect(renderResult.mock.calls[1][3].lastComponent).toBe(child);
  });

  it("lets Tron own the shell without passing its wrapper as an upstream component", () => {
    const renderCall = vi.fn((_args, innerTheme, ctx) => {
      expect(innerTheme.getBgAnsi("toolSuccessBg")).toBe("");
      expect(ctx.lastComponent).toBeUndefined();
      return { render: () => ["Agent badge"], invalidate() {} };
    });
    const tool = createCompactToolDefinition({ ...tools.get("Agent")!, renderCall }) as any;
    expect(text(tool.renderCall({}, { ...theme, getBgAnsi: () => "row tint" }, { ...context(), lastComponent: {} }))).toContain("Agent badge");
  });

  it("leaves generic custom tool collapsed/expanded behavior unchanged", () => {
    const renderCall = vi.fn(() => ({ render: () => ["upstream call"], invalidate() {} }));
    const tool = createCompactToolDefinition({ ...tools.get("Agent")!, name: "generic", renderCall,
      renderResult: () => ({ render: () => ["generic result"], invalidate() {} }),
    }) as any;
    expect(text(tool.renderCall({}, theme, context()))).toContain("generic");
    expect(renderCall).not.toHaveBeenCalled();
    expect(tool.renderResult(result(), { expanded: false }, theme, context()).render(80)).toEqual([]);
    expect(text(tool.renderResult(result(), { expanded: true }, theme, context()))).toContain("generic result");
  });

  it("retains expanded output and historical workflow text", () => {
    expect(text(wrapped().renderResult(result("completed"), { expanded: true }, theme, context()))).toContain("Stored result detail");
    expect(text(wrapped("SubagentWorkflow").renderResult(result(), { expanded: false }, theme, context()))).toContain("Stored result detail");
  });

  it.each([false, true])("retains agent/workflow shared group activity (expanded=%s)", (expanded) => {
    toolCallFrameSyncedIds.add("first"); toolCallFrameSyncedIds.add("last");
    toolCallTopBorderIds.add("first"); toolCallBottomBorderIds.add("last");
    collapsedToolGroupLeaderByToolCallId.set("last", "first");
    try {
      const first = wrapped(); const last = wrapped("SubagentWorkflow");
      const rows = [
        text(first.renderCall({ subagent_type: "Explore", description: "Inspect" }, theme, context("first"))),
        text(first.renderResult(result("running"), { expanded }, theme, context("first", expanded))),
        text(last.renderCall({ name: "review" }, theme, context("last"))),
        text(last.renderResult(result(), { expanded }, theme, context("last", expanded))),
      ].join("\n");
      expect(rows).toContain("reading file"); expect(rows).toContain("review");
      expect(rows).toContain("Stored result detail");
      expect(rows.match(/┌/g)).toHaveLength(1); expect(rows.match(/└/g)).toHaveLength(1);
    } finally {
      for (const id of ["first", "last"]) {
        toolCallFrameSyncedIds.delete(id); toolCallTopBorderIds.delete(id); toolCallBottomBorderIds.delete(id);
        collapsedToolGroupLeaderByToolCallId.delete(id);
      }
    }
  });
});

describe("live workflow transcript", () => {
  const input = (): WorkflowCardInput => ({
    task: { status: "running", workflowName: "review", startTime: Date.now() }, agentCount: 2,
    progress: [{ type: "workflow_agent", index: 0, label: "scan", state: "start" }],
  });
  it.each(["running", "paused", "failed", "killed", "completed"] as const)("shows actual %s progress", (status) => {
    const data = input(); data.task.status = status;
    const component = renderWorkflowToolResult("stored", () => data, false, false, theme);
    expect(text(component)).toContain(status); expect(text(component)).toContain("0/2 agents");
    expect(component.render(100)).toHaveLength(1);
  });
  it("re-reads mutable live state at the same width, including after invalidation", () => {
    const data = input();
    const tool = createCompactToolDefinition({ ...tools.get("SubagentWorkflow")!, renderResult: (_r, options) => renderWorkflowToolResult("stored", () => data, options.expanded, false, theme) }) as any;
    const component = tool.renderResult(result(), { expanded: false }, theme, context());
    expect(text(component)).toContain("0/2 agents");
    data.progress = [...data.progress, { type: "workflow_agent", index: 0, label: "scan", state: "done" }];
    data.task.status = "paused";
    component.invalidate();
    expect(text(component)).toContain("1/2 agents"); expect(text(component)).toContain("paused");
    data.task.status = "failed";
    expect(text(component)).toContain("failed");
  });
  it("expands the tree, inspection hint and stored output; clamps narrow rows", () => {
    const component = renderWorkflowToolResult("stored", input, true, false, theme);
    expect(text(component)).toContain("scan"); expect(text(component)).toContain("/agents"); expect(text(component)).toContain("stored");
    expect(component.render(24).every(line => visibleWidth(line) <= 24)).toBe(true);
  });
});
