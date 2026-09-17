import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { ToolExecutionComponent, type ExtensionAPI, type ExtensionContext, type ToolDefinition } from "@earendil-works/pi-coding-agent";
import { stripTerminalSequences, type TUI } from "@earendil-works/pi-tui";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import tintin from "../../packages/extension-core/subagent-tintin/src/index";
import { runWorkflow, type WorkflowRunResult } from "../../packages/extension-core/subagent-tintin/src/workflow/runtime";
import * as tasks from "../../packages/extension-core/subagent-tintin/src/workflow/task";
import { WORKFLOW_TICK_MS } from "../../packages/extension-core/subagent-tintin/src/ui/workflow-card";
import { createCompactToolDefinition } from "../../packages/extension-core/tron/src/compact-tool-lines/createCompactToolDefinition";

const settings = vi.hoisted(() => ({
  set: vi.fn((setters: { setWidgetMode(mode: string): void; setFleetView(enabled: boolean): void }) => {
    setters.setWidgetMode("off"); setters.setFleetView(false);
  }),
  directory: "",
}));
vi.mock("../../packages/extension-core/subagent-tintin/src/settings", async importOriginal => ({
  ...await importOriginal<typeof import("../../packages/extension-core/subagent-tintin/src/settings")>(),
  loadSettings: () => ({ widgetMode: "off", fleetView: false }),
  applyAndEmitLoaded: settings.set, saveAndEmitChanged: vi.fn(),
}));
vi.mock("../../packages/extension-core/subagent-tintin/src/custom-agents", () => ({ loadCustomAgents: () => [] }));
vi.mock("../../packages/extension-core/subagent-tintin/src/output-file", async importOriginal => ({
  ...await importOriginal<object>(), sessionTaskDir: () => settings.directory,
}));
vi.mock("../../packages/extension-core/subagent-tintin/src/workflow/runtime", async importOriginal => ({
  ...await importOriginal<object>(), runWorkflow: vi.fn(),
}));
// No agent execution or paid model calls. The actual registered execute method,
// task helpers, renderer, Tron wrapper and Pi ToolExecutionComponent remain real.
vi.mock("../../packages/extension-core/subagent-tintin/src/workflow/host", () => ({ createWorkflowHost: () => ({}) }));

const theme = {
  fg: (_color: string, value: string) => value,
  bg: (_color: string, value: string) => value,
  bold: (value: string) => value, italic: (value: string) => value,
  getBgAnsi: () => "",
};
const meta = { name: "verify", description: "Scripted repaint verification" };
let registered: Map<string, ToolDefinition>;
let shutdown: Array<() => unknown>;
let toolStart: Array<(event: unknown, ctx: ExtensionContext) => unknown>;
let task: tasks.WorkflowTask;
let resolveRun: (result: WorkflowRunResult) => void;
let rejectRun: (error: Error) => void;
let progress: NonNullable<Parameters<typeof runWorkflow>[0]["onProgress"]>;
let row: ToolExecutionComponent;
let screen: string;
let requestRender: ReturnType<typeof vi.fn>;
let setWidget: ReturnType<typeof vi.fn>;

beforeEach(() => {
  vi.useFakeTimers();
  settings.directory = mkdtempSync(join(tmpdir(), "nx-workflow-repaint-"));
  registered = new Map(); shutdown = []; toolStart = []; screen = "";
  (globalThis as Record<symbol, unknown>)[Symbol.for("@earendil-works/pi-coding-agent:theme")] = theme;
  const create = tasks.createWorkflowTask;
  vi.spyOn(tasks, "createWorkflowTask").mockImplementation(init => (task = create(init)));
  vi.mocked(runWorkflow).mockImplementation(options => {
    progress = options.onProgress!;
    options.onControl?.({ pause: vi.fn(), resume: vi.fn() } as never);
    return new Promise((resolve, reject) => { resolveRun = resolve; rejectRun = reject; });
  });
  const noop = vi.fn();
  tintin({
    registerTool: (tool: ToolDefinition) => registered.set(tool.name, tool),
    registerCommand: noop, registerShortcut: noop, registerFlag: noop,
    registerMessageRenderer: noop, registerEntryRenderer: noop, sendMessage: noop,
    events: { on: () => noop, emit: noop },
    on: (name: string, callback: any) => {
      if (name === "session_shutdown") shutdown.push(callback);
      if (name === "tool_execution_start") toolStart.push(callback);
    },
  } as unknown as ExtensionAPI);
});

afterEach(async () => {
  for (const callback of shutdown) await callback();
  vi.clearAllTimers(); vi.useRealTimers(); vi.restoreAllMocks();
  rmSync(settings.directory, { recursive: true, force: true });
});

async function launch(expanded = false) {
  setWidget = vi.fn();
  const ctx = {
    cwd: settings.directory, sessionManager: { getSessionId: () => "test" },
    ui: { theme, setWidget, setStatus: vi.fn(), onTerminalInput: () => vi.fn() },
  } as unknown as ExtensionContext;
  for (const callback of toolStart) await callback({}, ctx);
  const tool = createCompactToolDefinition(registered.get("SubagentWorkflow")!);
  const args = { script: `export const meta = ${JSON.stringify(meta)}; return 'not executed by test';` };
  const result = await tool.execute("workflow-call", args, undefined, undefined, ctx);
  requestRender = vi.fn(() => { screen = row.render(100).map(stripTerminalSequences).join("\n"); });
  row = new ToolExecutionComponent("SubagentWorkflow", "workflow-call", args, {}, tool, { requestRender } as unknown as TUI, settings.directory);
  row.setExpanded(expanded);
  row.updateResult({ ...result, isError: false });
  // Simulate only the initial host paint. All later paints MUST be requested
  // by the presentation timer through Pi's real renderContext.invalidate().
  screen = row.render(100).map(stripTerminalSequences).join("\n");
  requestRender.mockClear();
  expect(settings.set).toHaveBeenCalled();
  expect(setWidget.mock.calls.every(([, content]) => content === undefined)).toBe(true);
}

const outcome = (status: WorkflowRunResult["status"], value?: unknown, error?: string): WorkflowRunResult => ({
  status, meta, value, error, progress: [], agentCount: 1, replayedCount: 0,
});

describe("registered workflow automatic transcript repaint with fleet/widget off", () => {
  it.each([false, true])("retains a thrown workflow failure (expanded=%s)", async expanded => {
    await launch(expanded);
    rejectRun(new Error("workflow exploded: missing required input"));
    await vi.advanceTimersByTimeAsync(WORKFLOW_TICK_MS);
    expect(requestRender).toHaveBeenCalled();
    expect(task.status).toBe("failed");
    expect(screen).toContain("workflow exploded: missing required input");
    expect(screen).not.toContain("started in the background");
    const count = requestRender.mock.calls.length;
    await vi.advanceTimersByTimeAsync(3 * WORKFLOW_TICK_MS);
    expect(requestRender).toHaveBeenCalledTimes(count);
  });

  it.each([false, true])("retains a returned failure (expanded=%s)", async expanded => {
    await launch(expanded);
    resolveRun(outcome("failed", undefined, "worker rejected output schema"));
    await vi.advanceTimersByTimeAsync(WORKFLOW_TICK_MS);
    expect(screen).toContain("worker rejected output schema");
    expect(screen).not.toContain("started in the background");
  });

  it("automatically paints progress, pause, resume and actual completed output", async () => {
    await launch(true);
    progress([{ type: "workflow_agent", index: 0, label: "scan", state: "start" }]);
    await vi.advanceTimersByTimeAsync(WORKFLOW_TICK_MS);
    expect(screen).toContain("scan"); expect(screen).toContain("0/1 agent");
    expect(tasks.pauseWorkflowTask(task)).toBe(true);
    await vi.advanceTimersByTimeAsync(WORKFLOW_TICK_MS);
    expect(screen).toContain("paused");
    expect(tasks.resumeWorkflowTask(task)).toBe(true);
    progress([{ type: "workflow_agent", index: 0, label: "scan", state: "done" }]);
    await vi.advanceTimersByTimeAsync(WORKFLOW_TICK_MS);
    expect(screen).not.toContain("paused"); expect(screen).toContain("1/1 agent");
    resolveRun(outcome("completed", { finding: "all clear" }));
    await vi.advanceTimersByTimeAsync(WORKFLOW_TICK_MS);
    expect(screen).toContain("all clear"); expect(screen).toContain("done");
    expect(screen).not.toContain("started in the background");
    expect(setWidget.mock.calls.every(([, content]) => content === undefined)).toBe(true);
  });

  it("stops repainting on session shutdown even while the workflow is active", async () => {
    await launch();
    await vi.advanceTimersByTimeAsync(WORKFLOW_TICK_MS);
    expect(requestRender).toHaveBeenCalled();
    for (const callback of shutdown) await callback();
    shutdown = [];
    const count = requestRender.mock.calls.length;
    await vi.advanceTimersByTimeAsync(3 * WORKFLOW_TICK_MS);
    expect(requestRender).toHaveBeenCalledTimes(count);
    expect(vi.getTimerCount()).toBe(0);
  });
});
