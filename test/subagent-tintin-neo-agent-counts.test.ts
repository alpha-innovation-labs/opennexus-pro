import { afterEach, describe, expect, it, vi } from "vitest";
import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";
import { visibleWidth } from "@earendil-works/pi-tui";
import { runAgent } from "../packages/extension-core/subagent-tintin/src/agent-runner";
import { AgentManager } from "../packages/extension-core/subagent-tintin/src/agent-manager";
import { publishAgentCounts } from "../packages/extension-core/subagent-tintin/src/agent-counts";
import { createPromptlineStatusWidget } from "../packages/extension-core/neo-editor/src/features/promptline/status-widget/createPromptlineStatusWidget";
import { getPromptlineTpsLabel } from "../packages/extension-core/neo-editor/src/features/promptline/status-widget/promptlineTpsTracker";
import { installPromptlineFooter } from "../packages/extension-core/neo-editor/src/features/promptline/installPromptlineFooter";
import { registerPromptlineStatusWidget } from "../packages/extension-core/neo-editor/src/features/promptline/status-widget/registerPromptlineStatusWidget";

const runner = vi.hoisted(() => ({ runs: [] as Array<{ resolve: (result: any) => void; reject: (error: Error) => void }>, resumes: [] as Array<{ resolve: (result: any) => void; reject: (error: Error) => void }> }));
vi.mock("../packages/extension-core/subagent-tintin/src/agent-runner.js", () => ({
  runAgent: vi.fn(() => new Promise((resolve, reject) => runner.runs.push({ resolve, reject }))),
  resumeAgent: vi.fn(() => new Promise((resolve, reject) => runner.resumes.push({ resolve, reject }))),
}));
const managers: AgentManager[] = [];
const makeManager = (limit = 1) => { const manager = new AgentManager(undefined, limit); managers.push(manager); return manager; };
const tick = async () => { for (let i = 0; i < 8; i++) await Promise.resolve(); };
const piStub = {} as ExtensionAPI;
const ctxStub = { cwd: process.cwd() } as ExtensionContext;
const spawn = (manager: AgentManager, options = {}) => manager.spawn(piStub, ctxStub, "Explore", "scripted", { description: "test", isBackground: true, ...options });
const finish = (index: number, extra = {}) => runner.runs[index].resolve({ responseText: "done", session: { dispose() {} }, ...extra });
afterEach(async () => {
  for (const manager of managers.splice(0)) await manager.dispose();
  runner.runs.length = 0;
  runner.resumes.length = 0;
});

function bus() {
  const listeners = new Map<string, Set<(data: unknown) => void>>();
  return {
    on(name: string, listener: (data: unknown) => void) {
      if (!listeners.has(name)) listeners.set(name, new Set());
      listeners.get(name)!.add(listener);
      return () => { listeners.get(name)!.delete(listener); };
    },
    emit(name: string, data: unknown) { for (const listener of listeners.get(name) ?? []) listener(data); },
    size(name: string) { return listeners.get(name)?.size ?? 0; },
  };
}
function neo(events = bus(), sessionId = "session") {
  const handlers = new Map<string, Function>();
  let widget: ReturnType<typeof createPromptlineStatusWidget>;
  const tui = { terminal: { rows: 24, columns: 180 }, requestRender: vi.fn() };
  const setWidget = vi.fn((_key, factory) => { widget = factory(tui); });
  const ctx = {
    hasUI: true,
    model: { id: "test-model", provider: "test-provider" },
    ui: { setWidget, getEditorText: () => "", theme: { fg: (_color: string, text: string) => text } },
    sessionManager: { getSessionId: () => sessionId, getBranch: () => [{ type: "message" }] },
  } as unknown as ExtensionContext;
  const pi = { events, on: (name: string, handler: Function) => handlers.set(name, handler), getThinkingLevel: () => "high", getSessionName: () => "Session title" } as unknown as ExtensionAPI;
  registerPromptlineStatusWidget(pi);
  return { events, ctx, pi, setWidget, start: () => handlers.get("session_start")!({}, ctx), stop: () => handlers.get("session_shutdown")!({}, ctx), row: (width = 180) => widget!.render(width) };
}
const plain = (text: string) => text.replace(/\x1b\[[0-9;]*m/g, "");

describe("record-owned live agent counts", () => {
  it("counts running and queued top-level records, not hidden children, workflow-owned records or linger", async () => {
    const manager = makeManager();
    const observer = vi.fn();
    manager.subscribeAgentCounts(observer);
    const first = spawn(manager);
    const queued = spawn(manager);
    spawn(manager, { parentAgentId: first });
    spawn(manager, { workflowId: "workflow-container" });
    spawn(manager, { isBackground: false });
    await tick();
    expect(manager.getAgentCounts()).toEqual({ running: 2, queued: 1 });
    expect(observer).toHaveBeenLastCalledWith({ running: 2, queued: 1 });
    manager.abort(queued);
    await tick();
    expect(observer).toHaveBeenLastCalledWith({ running: 2, queued: 0 });
    finish(0);
    finish(3);
    await tick();
    expect(manager.getRecord(first)?.status).toBe("completed");
    expect(manager.listAgents().length).toBe(5);
    expect(observer).toHaveBeenLastCalledWith({ running: 0, queued: 0 });
  });

  it("refreshes on drain, capacity changes, failures, and stop without main-agent turns", async () => {
    const manager = makeManager();
    const observer = vi.fn();
    manager.subscribeAgentCounts(observer);
    spawn(manager); spawn(manager); spawn(manager);
    await tick();
    expect(observer).toHaveBeenLastCalledWith({ running: 1, queued: 2 });
    finish(0);
    await tick();
    expect(observer).toHaveBeenLastCalledWith({ running: 1, queued: 1 });
    manager.setMaxConcurrent(2);
    await tick();
    expect(observer).toHaveBeenLastCalledWith({ running: 2, queued: 0 });
    runner.runs[1].reject(new Error("scripted failure"));
    await tick();
    expect(observer).toHaveBeenLastCalledWith({ running: 1, queued: 0 });
    manager.abortAll();
    await tick();
    expect(observer).toHaveBeenLastCalledWith({ running: 0, queued: 0 });
  });

  it("publishes queued and running background resumes plus foreground resume completion", async () => {
    const manager = makeManager();
    const observer = vi.fn();
    manager.subscribeAgentCounts(observer);
    const resumed = spawn(manager);
    finish(0); await tick();
    spawn(manager);
    await manager.resume(resumed, "again", undefined, { isBackground: true });
    await tick();
    expect(observer).toHaveBeenLastCalledWith({ running: 1, queued: 1 });
    finish(1); await tick();
    expect(observer).toHaveBeenLastCalledWith({ running: 1, queued: 0 });
    runner.resumes[0].resolve({ text: "resumed" }); await tick();
    expect(observer).toHaveBeenLastCalledWith({ running: 0, queued: 0 });
    const foreground = manager.resume(resumed, "inline");
    await tick();
    expect(observer).toHaveBeenLastCalledWith({ running: 1, queued: 0 });
    runner.resumes[1].reject(new Error("resume failed"));
    await foreground; await tick();
    expect(observer).toHaveBeenLastCalledWith({ running: 0, queued: 0 });
  });

  it("clears counts on startup rejection and does not count pre-aborted queued work", async () => {
    const manager = makeManager();
    const observer = vi.fn();
    manager.subscribeAgentCounts(observer);
    vi.mocked(runAgent).mockImplementationOnce(() => { throw new Error("startup failed"); });
    const failed = spawn(manager);
    await expect(manager.awaitStartup(failed)).rejects.toThrow("startup failed");
    await tick();
    expect(manager.getRecord(failed)).toBeUndefined();
    expect(observer).toHaveBeenLastCalledWith({ running: 0, queued: 0 });
    // A fresh manager avoids depending on how the runner failure releases slots.
    const queuedManager = makeManager();
    spawn(queuedManager);
    const stopped = spawn(queuedManager, { signal: AbortSignal.abort() });
    await tick();
    expect(queuedManager.getRecord(stopped)?.status).toBe("stopped");
    expect(queuedManager.getAgentCounts()).toEqual({ running: 1, queued: 0 });
  });

  it("resets observers on disposal and isolates throwing/unsubscribed consumers", async () => {
    const manager = makeManager();
    const id = spawn(manager);
    const observer = vi.fn();
    manager.subscribeAgentCounts(observer);
    manager.subscribeAgentCounts(() => { throw new Error("UI failed"); });
    manager.abort(id); await tick();
    expect(observer).toHaveBeenLastCalledWith({ running: 0, queued: 0 });
    const removed = vi.fn();
    const unsubscribe = manager.subscribeAgentCounts(removed);
    unsubscribe(); removed.mockClear();
    spawn(manager); await tick();
    await manager.dispose();
    expect(observer).toHaveBeenLastCalledWith({ running: 0, queued: 0 });
    observer.mockClear();
    manager.abortAll(); await tick();
    expect(observer).not.toHaveBeenCalled();
    expect(removed).not.toHaveBeenCalled();
  });
});

describe("Neo metadata counts bridge", () => {
  it("keeps Pi's footer empty", () => {
    const setFooter = vi.fn();
    installPromptlineFooter({ ui: { setFooter } } as unknown as ExtensionContext);
    expect(setFooter.mock.calls[0][0]().render(180)).toEqual([]);
  });
  it.each([true, false])("updates idle Neo with either activation order (producer first: %s), without a fleet", async producerFirst => {
    const manager = makeManager();
    const ui = neo();
    let dispose!: () => void;
    if (producerFirst) dispose = publishAgentCounts(ui.pi.events, manager, "session");
    await ui.start();
    if (!producerFirst) dispose = publishAgentCounts(ui.pi.events, manager, "session");
    expect(plain(ui.row()[0])).not.toContain("running");
    spawn(manager); spawn(manager); await tick();
    expect(plain(ui.row()[0])).toContain("1 running · 1 queued");
    expect(ui.row()).toHaveLength(1);
    for (const part of ["test-provider", "test-model", "high", "Session title", plain(getPromptlineTpsLabel()), "0s"]) expect(plain(ui.row()[0])).toContain(part);
    const calls = ui.setWidget.mock.calls.length;
    ui.events.emit("subagents:counts", { sessionId: "other", running: 90, queued: 90 });
    ui.events.emit("subagents:counts", { sessionId: "session", running: -1, queued: 0 });
    expect(ui.setWidget).toHaveBeenCalledTimes(calls);
    manager.abortAll(); await tick();
    expect(plain(ui.row()[0])).not.toContain("running");
    dispose(); dispose(); await ui.stop();
    expect(ui.events.size("subagents:counts")).toBe(0);
    expect(ui.events.size("subagents:counts:request")).toBe(0);
  });

  it("clears session subscriptions/counts and obtains snapshots when Neo attaches late", async () => {
    const manager = makeManager();
    spawn(manager); await tick();
    const ui = neo();
    const dispose = publishAgentCounts(ui.pi.events, manager, "session");
    await ui.start();
    expect(plain(ui.row()[0])).toContain("1 running");
    await ui.start();
    expect(ui.events.size("subagents:counts")).toBe(1);
    dispose();
    expect(plain(ui.row()[0])).not.toContain("running");
    await ui.stop();
    const calls = ui.setWidget.mock.calls.length;
    ui.events.emit("subagents:counts", { sessionId: "session", running: 9, queued: 9 });
    expect(ui.setWidget).toHaveBeenCalledTimes(calls);
    const next = neo(ui.events, "next-session");
    await next.start();
    expect(plain(next.row()[0])).not.toContain("running");
    await next.stop();
  });

  it("does not subscribe without a UI", async () => {
    const ui = neo();
    Object.assign(ui.ctx, { hasUI: false });
    await ui.start();
    expect(ui.events.size("subagents:counts")).toBe(0);
    expect(ui.setWidget).not.toHaveBeenCalled();
    await ui.stop();
  });

  it("includes counts in cache identity and preserves measured single-row bounds", () => {
    const ui = neo();
    let label = "";
    const widget = createPromptlineStatusWidget(ui.ctx, () => "high", () => "Very long 界 session title ".repeat(20), () => label);
    const empty = widget.render(180);
    expect(widget.render(180)).toBe(empty);
    label = "12 running · 34 queued";
    const active = widget.render(180);
    expect(active).not.toBe(empty);
    expect(plain(active[0])).toContain(label);
    expect(widget.render(180)).toBe(active);
    for (let width = 0; width <= 180; width++) {
      const rows = widget.render(width);
      expect(rows).toHaveLength(1);
      expect(visibleWidth(rows[0]), `width ${width}`).toBeLessThanOrEqual(width);
    }
    label = "";
    expect(plain(widget.render(180)[0])).not.toContain("queued");
  });
});
