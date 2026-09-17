import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync, rmSync } from "node:fs";
import { join } from "node:path";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { matchesKey, stripTerminalSequences } from "@earendil-works/pi-tui";
import tintin from "../packages/extension-core/subagent-tintin/src/index";
import { AgentManager } from "../packages/extension-core/subagent-tintin/src/agent-manager";
import * as worktree from "../packages/extension-core/subagent-tintin/src/worktree";

// Real registration, menus, persistence, manager, scheduler and workflow host.
// Only model/session and worker/worktree boundaries are fake. No autonomous
// agents, providers, shell commands or real worktrees are started by this file.
const fake = vi.hoisted(() => ({ runs: [] as any[], resumes: [] as any[], workers: [] as any[], clones: [] as any[] }));
vi.mock("node:worker_threads", async original => {
  const { EventEmitter } = await import("node:events");
  return { ...await original<object>(), Worker: class extends EventEmitter {
    postMessage = vi.fn(); terminate = vi.fn(async () => 0);
    constructor() { super(); fake.workers.push(this); }
  } };
});
vi.mock("../packages/extension-core/subagent-tintin/src/agent-runner.js", async original => ({
  ...await original<object>(),
  runAgent: vi.fn((ctx, type, prompt, options) => new Promise(resolve => {
    const session = { messages: [{ role: "user", content: prompt }] as any[], subscribe: () => () => {},
      steer: vi.fn(async () => {}), abort: vi.fn(async () => {}), dispose: vi.fn(),
      extensionRunner: { hasHandlers: () => true, emit: vi.fn(async () => {}) },
      sessionManager: { getSessionFile: () => undefined } };
    const finish = (text = "fixture answer", failure?: string) => {
      session.messages.push({ role: "assistant", content: [{ type: "text", text }] });
      resolve({ responseText: text, session, failure });
    };
    fake.runs.push({ ctx, type, prompt, options, session, finish });
    options.signal?.addEventListener("abort", () => finish("cancelled"), { once: true });
    queueMicrotask(() => options.onSessionCreated?.(session));
  })),
  resumeAgent: vi.fn((session, prompt, options) => new Promise(resolve => {
    const finish = (text = "resumed answer") => resolve({ text });
    fake.resumes.push({ session, prompt, options, finish });
    options.signal?.addEventListener("abort", () => finish("cancelled"), { once: true });
  })),
}));
vi.mock("../packages/extension-core/subagent-tintin/src/mention-clone.js", () => ({
  runMentionClone: async (args: any) => {
    fake.clones.push(args);
    // Simulate the off-screen model calling the ACTUAL registered Agent tool.
    await args.agentTool.execute("clone-call", { subagent_type: args.type, description: "clone task", prompt: `context: ${args.message}`, run_in_background: true }, undefined, undefined, args.ctx);
    return { spawned: true };
  },
}));
const theme: any = { fg: (_: string, s: string) => s, bg: (_: string, s: string) => s, bold: (s: string) => s, getBgAnsi: () => "" };
const kb: any = { matches: (data: string, id: string) => matchesKey(data, ({ confirm: "enter", submit: "enter", cancel: "escape", pageUp: "pageUp", pageDown: "pageDown" } as any)[id.split(".").at(-1)!] ?? id.split(".").at(-1) as any) };
let dir: string;
let shutdown: (() => Promise<any>) | undefined;
beforeEach(() => {
  dir = mkdtempSync("/tmp/nx-registered-controls-");
  for (const path of ["global", ".pi", "config"]) mkdirSync(join(dir, path));
  vi.stubEnv("HOME", dir); vi.stubEnv("PI_CODING_AGENT_DIR", join(dir, "global")); vi.stubEnv("NEXUS_CONFIG_DIR", join(dir, "config")); vi.stubEnv("TMPDIR", dir);
  vi.spyOn(process, "cwd").mockReturnValue(dir);
  vi.useFakeTimers({ toFake: ["Date", "setTimeout", "clearTimeout", "setInterval", "clearInterval"] });
  vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));
  for (const list of Object.values(fake)) list.length = 0;
  vi.spyOn(worktree, "pruneWorktrees").mockResolvedValue(undefined);
  vi.spyOn(worktree, "createWorktree").mockImplementation(async () => { throw new Error("Unexpected worktree request"); });
  vi.spyOn(worktree, "cleanupWorktree").mockResolvedValue({} as any);
});
afterEach(async () => {
  await shutdown?.(); shutdown = undefined;
  vi.clearAllTimers(); vi.useRealTimers(); vi.restoreAllMocks(); vi.unstubAllEnvs();
  rmSync(dir, { recursive: true, force: true });
});
const drain = async () => { for (let i = 0; i < 12; i++) await new Promise(resolve => setImmediate(resolve)); };
const screen = (dialog: any) => dialog.render(180).map(stripTerminalSequences).join("\n");
function choose(dialog: any, label: string) {
  for (let i = 0; i < 90; i++) {
    if (screen(dialog).split("\n").some((line: string) => line.includes("❯") && line.slice(line.indexOf("❯") + 1).trimStart().startsWith(label))) {
      dialog.handleInput("\r"); return;
    }
    dialog.handleInput("\x1b[B");
  }
  throw new Error(`Missing selectable ${label}:\n${screen(dialog)}`);
}
type Step = string | ((dialog: any) => void | Promise<void>);
async function boot(settings: object = {}) {
  writeFileSync(join(dir, ".pi/subagents.json"), JSON.stringify({ outputTranscript: false, schedulingEnabled: false, fleetView: false, maxConcurrent: 1, maxConcurrentForeground: 0, defaultMaxTurns: 0, graceTurns: 2, maxSubagentDepth: 3, defaultJoinMode: "smart", backgroundByDefault: true, disableDefaultAgents: false, fallbackSubagent: "general-purpose", worktreeIsolation: true, workflowsEnabled: true, scopeModels: false, strictAgentFiles: false, reportUsage: false, showCost: true, showModel: true, viewerMarkdown: "assistant", agentMentions: "model", rememberAgents: false, widgetMode: "off", toolDescriptionMode: "full", ...settings }));
  const callbacks = new Map<string, Function[]>(), commands = new Map<string, any>(), tools = new Map<string, any>();
  const listeners = new Map<string, Set<Function>>();
  const steps: Step[] = [], inputs: any[] = [], editors: any[] = [], confirmations: boolean[] = [], widgets = new Map<string, any>();
  const tui: any = { terminal: { rows: 60, columns: 180 }, requestRender: vi.fn() };
  const ui: any = { theme, notify: vi.fn(), setStatus: vi.fn(), addAutocompleteProvider: vi.fn(), getEditorText: () => "", onTerminalInput: () => () => {},
    setWidget: (key: string, factory: any) => factory ? widgets.set(key, factory(tui, theme)) : widgets.delete(key),
    input: vi.fn(async () => { expect(inputs.length, "unscripted input").toBeGreaterThan(0); return inputs.shift(); }),
    editor: vi.fn(async () => { expect(editors.length, "unscripted editor").toBeGreaterThan(0); return editors.shift(); }),
    confirm: vi.fn(async () => { expect(confirmations.length, "unscripted confirm").toBeGreaterThan(0); return confirmations.shift(); }),
    custom: async (factory: any, options: any) => {
      let result: any, done = false;
      const dialog = factory(tui, theme, kb, (value: any) => { result = value; done = true; });
      const overlay = { setHidden: vi.fn() }; options?.onHandle?.(overlay);
      expect(steps.length, `unscripted modal:\n${screen(dialog)}`).toBeGreaterThan(0);
      const step = steps.shift()!;
      if (typeof step === "string") step === "ESC" ? dialog.handleInput("\x1b") : choose(dialog, step);
      else await step(dialog);
      expect(done, `modal not dismissed:\n${screen(dialog)}`).toBe(true);
      return result;
    },
  };
  const pi: any = { on: (name: string, fn: Function) => callbacks.set(name, [...callbacks.get(name) ?? [], fn]),
    registerCommand: (name: string, command: any) => commands.set(name, command), registerTool: (tool: any) => tools.set(tool.name, tool),
    registerFlag: vi.fn(), registerShortcut: vi.fn(), registerMessageRenderer: vi.fn(), registerEntryRenderer: vi.fn(),
    getFlag: () => undefined, getAllTools: () => [...tools.values()], getActiveTools: () => [...tools.keys()], setActiveTools: vi.fn(),
    getThinkingLevel: () => "off", sendMessage: vi.fn(), appendEntry: vi.fn(),
    exec: vi.fn(async () => { throw new Error("No subprocesses permitted"); }),
    events: { emit: vi.fn((name: string, data: any) => { for (const fn of listeners.get(name) ?? []) fn(data); }),
      on: (name: string, fn: Function) => { if (!listeners.has(name)) listeners.set(name, new Set()); listeners.get(name)!.add(fn); return () => listeners.get(name)!.delete(fn); } },
  };
  const ctx: any = { cwd: dir, hasUI: true, mode: "tui", ui, model: { id: "fixture", provider: "fake" }, isIdle: () => true,
    modelRegistry: { getAvailable: () => [], getAll: () => [] }, getSystemPrompt: () => "Fixture",
    sessionManager: { getSessionId: () => "controls", getSessionFile: () => undefined, getLeafId: () => undefined, getBranch: () => [], getEntries: () => [], getSessionDir: () => dir } };
  tintin(pi);
  const fire = async (name: string, event = {}) => { let result; for (const fn of callbacks.get(name) ?? []) result = await fn(event, ctx); return result; };
  shutdown = () => fire("session_shutdown");
  await fire("session_start");
  const menu = async (...script: Step[]) => { steps.push(...script); await commands.get("agents").handler("", ctx); expect(steps).toEqual([]); };
  const invoke = (name: string, args: any, signal?: AbortSignal) => tools.get(name).execute(`call-${name}`, args, signal, undefined, ctx);
  const saved = () => JSON.parse(readFileSync(join(dir, ".pi/subagents.json"), "utf8"));
  return { pi, ctx, ui, fire, menu, invoke, inputs, editors, confirmations, tools, widgets, saved, steps };
}
const args = (name = "scout", extra = {}) => ({ subagent_type: "Explore", name, prompt: `Inspect ${name}`, description: `${name} task`, run_in_background: true, ...extra });
const typeAction = (name: string, action: string, ...extra: Step[]): Step[] => ["Agent types", name, action, ...extra, "ESC", "ESC"];

it("creates, manually edits, disables/enables and deletes through registered /agents, with cancellation", async () => {
  const app = await boot();
  await app.menu("Create new agent", "ESC");
  expect(existsSync(join(dir, ".pi/agents"))).toBe(false);
  app.inputs.push("fixture", "fixture description"); app.editors.push("Only inspect fixtures.");
  await app.menu("Create new agent", "Project", "Manual configuration", "none", "inherit", "inherit");
  const path = join(dir, ".pi/agents/fixture.md");
  const original = readFileSync(path, "utf8");
  expect(original).toContain("tools: none"); expect(original).toContain("Only inspect fixtures.");
  app.editors.push(undefined); await app.menu(...typeAction("•  fixture", "Edit"));
  expect(readFileSync(path, "utf8")).toBe(original);
  app.editors.push(original.replace("Only inspect", "Carefully inspect")); await app.menu(...typeAction("•  fixture", "Edit"));
  expect(readFileSync(path, "utf8")).toContain("Carefully inspect");
  await app.menu(...typeAction("•  fixture", "Disable")); expect(readFileSync(path, "utf8")).toContain("enabled: false");
  await app.menu(...typeAction("✕• fixture", "Enable")); expect(readFileSync(path, "utf8")).not.toContain("enabled: false");
  app.confirmations.push(false); await app.menu(...typeAction("•  fixture", "Delete")); expect(existsSync(path)).toBe(true);
  app.confirmations.push(true); await app.menu(...typeAction("•  fixture", "Delete")); expect(existsSync(path)).toBe(false);
  expect(fake.runs).toEqual([]); expect(app.pi.exec).not.toHaveBeenCalled();
});

it("ejects/resets defaults and enables a disabled stub without touching personal config", async () => {
  const app = await boot(); const path = join(dir, ".pi/agents/Explore.md");
  await app.menu(...typeAction("Explore", "Eject", "ESC")); expect(existsSync(path)).toBe(false);
  await app.menu(...typeAction("Explore", "Eject", "Project")); expect(readFileSync(path, "utf8")).toContain("---");
  app.confirmations.push(false); await app.menu(...typeAction("•  Explore", "Reset to default")); expect(existsSync(path)).toBe(true);
  app.confirmations.push(true); await app.menu(...typeAction("•  Explore", "Reset to default")); expect(existsSync(path)).toBe(false);
  await app.menu(...typeAction("Explore", "Disable", "Project")); expect(readFileSync(path, "utf8")).toBe("---\nenabled: false\n---\n");
  await app.menu(...typeAction("✕• Explore", "Enable")); expect(existsSync(path)).toBe(false);
  expect(existsSync(join(dir, "global/agents"))).toBe(false);
});

it("applies every cycling settings id through the registered dialog and persists only its effective choice", async () => {
  const app = await boot({ widgetMode: "all", scopeModels: true, strictAgentFiles: true, reportUsage: true, showCost: true, showModel: true, rememberAgents: true });
  const cases: Array<[string, string, any]> = [
    ["Join mode", "defaultJoinMode", "async"], ["Background by default", "backgroundByDefault", false],
    ["Scheduling", "schedulingEnabled", true], ["Workflows", "workflowsEnabled", false],
    ["Scope models", "scopeModels", false], ["Strict agent files", "strictAgentFiles", false],
    ["Fallback agent", "fallbackSubagent", "Explore"], ["Output transcript", "outputTranscript", true],
    ["Worktree isolation", "worktreeIsolation", false], ["Report usage to session", "reportUsage", false],
    ["Show cost", "showCost", false], ["Show model", "showModel", false], ["Viewer markdown", "viewerMarkdown", "all"],
    ["Fleet view", "fleetView", true], ["Agent mentions", "agentMentions", "direct"],
    ["Remember agents", "rememberAgents", false], ["Widget (dormant: fleet enabled)", "widgetMode", "background"],
    ["Tool description", "toolDescriptionMode", "compact"], ["Disable defaults", "disableDefaultAgents", true],
  ];
  await app.menu("Settings", dialog => {
    for (const [label, key, value] of cases) { choose(dialog, label); expect(app.saved()[key], key).toEqual(value); }
    expect(app.saved()).toMatchObject({ fleetView: true, widgetMode: "background" });
    expect(app.widgets.has("agents")).toBe(false);
    dialog.handleInput("\x1b");
  }, "ESC");
  expect(fake.runs).toEqual([]); expect(app.pi.exec).not.toHaveBeenCalled();
});

it.each([
  ["Max concurrency", "maxConcurrent", "7"], ["Max foreground concurrency", "maxConcurrentForeground", "0"],
  ["Default max turns", "defaultMaxTurns", "0"], ["Grace turns", "graceTurns", "4"], ["Nested depth", "maxSubagentDepth", "0"],
])("validates and persists numeric %s and cancellation", async (label, key, value) => {
  const app = await boot();
  const invalid = ["not a number", "1.5", "", "-1", "9007199254740992", ...(key === "maxConcurrent" || key === "graceTurns" ? ["0"] : [])];
  app.inputs.push(...invalid, ` ${value} `);
  await app.menu("Settings", label, "ESC", "ESC");
  expect(app.ui.input).toHaveBeenCalledTimes(invalid.length + 1); expect(app.saved()[key]).toBe(Number(value));
  const before = readFileSync(join(dir, ".pi/subagents.json"), "utf8");
  app.inputs.push(undefined); await app.menu("Settings", label, "ESC");
  expect(readFileSync(join(dir, ".pi/subagents.json"), "utf8")).toBe(before);
});

it.each(["off", "direct", "model"])("dispatches actual input callback in %s mention mode", async mode => {
  const app = await boot({ agentMentions: mode });
  expect(await app.fire("input", { text: "@Explore inspect fixtures", source: "interactive" })).toEqual({ action: mode === "off" ? "continue" : "handled" });
  await drain();
  expect(fake.runs).toHaveLength(mode === "off" ? 0 : 1);
  expect(fake.clones).toHaveLength(mode === "model" ? 1 : 0);
  if (mode !== "off") expect(fake.runs[0]).toMatchObject({ type: "Explore", prompt: mode === "model" ? "context: inspect fixtures" : "inspect fixtures" });
  expect(await app.fire("input", { text: "@Plan ignore", source: "extension" })).toEqual({ action: "continue" });
  expect(fake.runs).toHaveLength(mode === "off" ? 0 : 1);
});

it("steers queued mentions, opens running/queued/settled conversations, resumes history and stops via the real viewer", async () => {
  const app = await boot({ agentMentions: "direct" });
  const first = await app.invoke("Agent", args()); const second = await app.invoke("Agent", args("reviewer"));
  expect(second.details.status).toBe("background");
  expect(fake.runs).toHaveLength(1);
  expect(await app.fire("input", { text: "@reviewer additional check", source: "interactive" })).toEqual({ action: "handled" });
  await app.menu("Running agents", "2.", "ESC", "ESC");
  expect(app.ui.notify).toHaveBeenCalledWith("Agent is queued — no session available.", "info");
  fake.runs[0].finish("first answer"); await drain();
  expect(fake.runs[1].session.steer).toHaveBeenCalledWith("additional check");
  await app.menu("Running agents", "1.", dialog => { expect(screen(dialog)).toContain("scout"); expect(screen(dialog)).toContain("first answer"); dialog.handleInput("\x1b"); }, "ESC", "ESC");
  expect(await app.fire("input", { text: "@scout continue history", source: "interactive" })).toEqual({ action: "handled" });
  await drain();
  expect(fake.resumes).toHaveLength(0); // resume waits for the occupied background slot
  await app.menu("Running agents", "2.", dialog => {
    dialog.handleInput("\r"); dialog.handleInput("viewer instruction"); dialog.handleInput("\r");
    expect(fake.runs[1].session.steer).toHaveBeenCalledWith("viewer instruction");
    dialog.handleInput("\r"); dialog.handleInput("cancelled message"); dialog.handleInput("\x1b");
    expect(fake.runs[1].session.steer).not.toHaveBeenCalledWith("cancelled message");
    dialog.handleInput("m"); expect(app.saved().viewerMarkdown).toBe("all");
    dialog.handleInput("x"); expect(screen(dialog)).toContain("x again to STOP");
    dialog.handleInput("x"); dialog.handleInput("\x1b");
  }, "ESC", "ESC");
  await drain();
  expect(fake.runs[1].options.signal.aborted).toBe(true);
  expect(fake.resumes[0]).toMatchObject({ session: fake.runs[0].session, prompt: "continue history" });
  const result = await app.invoke("get_subagent_result", { agent_id: second.details.agentId });
  expect(JSON.stringify(result)).toContain("Status: stopped");
  expect(first.details.agentId).not.toBe(second.details.agentId);
});

it("preserves foreground, background, cancellation, results, notifications and shutdown boundaries", async () => {
  const app = await boot(); const controller = new AbortController();
  const pending = app.invoke("Agent", args("foreground", { run_in_background: false }), controller.signal);
  await drain(); expect(fake.runs).toHaveLength(1);
  controller.abort(); const cancelled = await pending; expect(cancelled.details.status).toMatch(/stopped|aborted/);
  const started = await app.invoke("Agent", args("background")); expect(started.details.status).toBe("background");
  fake.runs[1].finish("background evidence"); await drain(); await vi.advanceTimersByTimeAsync(1000);
  expect(JSON.stringify(app.pi.sendMessage.mock.calls)).toContain("background evidence");
  const result = await app.invoke("get_subagent_result", { agent_id: started.details.agentId }); expect(JSON.stringify(result)).toContain("background evidence");
  const resumed = await app.invoke("Agent", args("background", { resume: started.details.agentId })); expect(resumed.details.status).toBe("background");
  expect(fake.resumes[0].session).toBe(fake.runs[1].session);
  await app.fire("session_shutdown");
  const notificationCount = app.pi.sendMessage.mock.calls.length;
  await drain(); await vi.advanceTimersByTimeAsync(2000);
  expect(app.pi.sendMessage.mock.calls).toHaveLength(notificationCount);
  expect(fake.resumes[0].options.signal.aborted).toBe(true);
  for (const run of fake.runs) { expect(run.session.extensionRunner.emit).toHaveBeenCalledWith({ type: "session_shutdown", reason: "quit" }); expect(run.session.dispose).toHaveBeenCalled(); }
  expect(app.pi.exec).not.toHaveBeenCalled();
});

it("forwards worktree configuration only across mocked isolation boundaries", async () => {
  const app = await boot();
  const wt = { path: join(dir, "fake-tree"), workPath: join(dir, "fake-tree"), branch: "fake-branch" };
  vi.mocked(worktree.createWorktree).mockResolvedValue(wt as any);
  const result = await app.invoke("Agent", args("isolated", { isolation: "worktree", isolated: true, inherit_context: true, max_turns: 3 }));
  expect(worktree.createWorktree).toHaveBeenCalled();
  expect(fake.runs[0].options).toMatchObject({ cwd: wt.path, worktreeBase: dir, isolated: true, inheritContext: true, maxTurns: 3 });
  fake.runs[0].finish(); await drain();
  expect(worktree.cleanupWorktree).toHaveBeenCalledWith(app.pi, dir, wt, "isolated task");
  expect(result.details.agentId).toBeTruthy(); expect(app.pi.exec).not.toHaveBeenCalled();
});

it.each([false, true])("gates schedules and persists inspected/kept/cancelled jobs (enabled=%s)", async enabled => {
  const app = await boot({ schedulingEnabled: enabled });
  const result = await app.invoke("Agent", args("scheduled", { schedule: "1h" }));
  if (!enabled) {
    expect(JSON.stringify(result)).toContain("Scheduling is disabled");
    await app.menu(dialog => { expect(screen(dialog)).not.toContain("Scheduled jobs"); dialog.handleInput("\x1b"); });
  } else {
    expect(JSON.stringify(result)).toContain('Scheduled');
    const persisted = () => JSON.parse(readFileSync(join(dir, ".pi/subagent-schedules/controls.json"), "utf8")).jobs;
    expect(persisted()).toHaveLength(1);
    expect(persisted()[0]).toMatchObject({ name: "scheduled task", prompt: "Inspect scheduled", schedule: "1h", subagent_type: "Explore" });
    await app.menu("Scheduled jobs", "1.", dialog => {
      expect(screen(dialog)).toContain("Inspect scheduled");
      expect(screen(dialog)).toContain("1h"); choose(dialog, "Keep job");
    }, "ESC");
    expect(persisted()).toHaveLength(1);
    await app.menu("Scheduled jobs", "1.", "Cancel job", "ESC");
    expect(persisted()).toEqual([]);
    expect(app.ui.notify).toHaveBeenCalledWith('Cancelled "scheduled task".', "info");
    await app.menu("Scheduled jobs", "ESC");
    expect(app.ui.notify).toHaveBeenCalledWith("No scheduled jobs.", "info");
  }
  expect(fake.runs).toEqual([]); expect(app.pi.exec).not.toHaveBeenCalled();
});

it("gates workflows off at registration and the actual menu", async () => {
  const app = await boot({ workflowsEnabled: false });
  expect(app.tools.has("SubagentWorkflow")).toBe(false);
  await app.menu(dialog => { expect(screen(dialog)).not.toContain("Workflows"); dialog.handleInput("\x1b"); });
  expect(fake.workers).toEqual([]);
});

it("routes workflow menu drill-down, filtering, conversation, pause/resume, retry/skip and kill to real runtime controls", async () => {
  const app = await boot();
  const spawn = vi.spyOn(AgentManager.prototype, "spawn");
  await app.invoke("SubagentWorkflow", { script: 'export const meta = { name: "control-flow", description: "fixture" }; return 1;' });
  const worker = fake.workers[0];
  const call = (id: number, label: string) => worker.emit("message", { type: "call", method: "agent", callId: id,
    payload: { prompt: `inspect ${label}`, label, agentType: "Explore", phaseIndex: 0, phaseTitle: "Inspection" } });
  worker.emit("message", { type: "progress", entries: [{ type: "workflow_phase", index: 0, title: "Inspection" }] });
  call(1, "first"); await drain();
  expect(fake.runs).toHaveLength(1);
  expect(spawn.mock.calls[0][4]).toMatchObject({ workflowId: expect.stringMatching(/^wf_/), description: "first" });
  // The nested viewer is opened by the real workflow-menu adapter, not a spy.
  await app.menu("Workflows", async dialog => {
    expect(screen(dialog)).toContain("Inspection");
    dialog.handleInput("p"); expect(screen(dialog)).toMatch(/paused/i);
    call(2, "second"); await drain(); expect(fake.runs).toHaveLength(1);
    dialog.handleInput("f"); expect(screen(dialog)).toContain("running");
    for (let i = 0; i < 7; i++) dialog.handleInput("f"); // all again
    dialog.handleInput("\r"); // phase -> agent
    dialog.handleInput("e"); expect(screen(dialog)).toContain("inspect first");
    app.steps.unshift(viewer => { expect(screen(viewer)).toContain("first"); viewer.handleInput("\x1b"); });
    dialog.handleInput("c"); await drain();
    dialog.handleInput("r"); await drain();
    expect(fake.runs[0].options.signal.aborted).toBe(true);
    expect(fake.runs).toHaveLength(1); // retry is held behind pause too
    dialog.handleInput("p"); await drain(); expect(fake.runs.length).toBe(3);
    expect(fake.runs.slice(1).map(run => run.prompt).sort()).toEqual(["inspect first", "inspect second"]);
    // Retry the selected running row; real host aborts it and starts a replacement.
    dialog.handleInput("r"); await drain(); expect(fake.runs).toHaveLength(4);
    dialog.handleInput("s"); await drain();
    const afterSkip = fake.runs.length;
    dialog.handleInput("r"); dialog.handleInput("s"); await drain();
    expect(fake.runs).toHaveLength(afterSkip); // settled/skipped cannot retry or skip
    expect(worker.postMessage.mock.calls.some(([message]: any[]) => message.type === "response" && message.callId === 1)).toBe(true);
    dialog.handleInput("x"); await drain();
    expect(worker.terminate).toHaveBeenCalledTimes(1);
    expect(fake.runs.every(run => run.options.signal.aborted)).toBe(true);
    dialog.handleInput("\x1b"); dialog.handleInput("\x1b");
  }, "ESC");
  expect(app.ui.notify).toHaveBeenCalledWith('Stopped workflow "control-flow".', "info");
  expect(app.pi.exec).not.toHaveBeenCalled();
});

it("keeps queued workflow retry ineligible, skips without spawning, and disables settled controls", async () => {
  const app = await boot();
  const started = await app.invoke("SubagentWorkflow", { script: 'export const meta = { name: "queued-flow", description: "fixture" }; return 1;' });
  const worker = fake.workers[0];
  await app.menu("Workflows", async dialog => {
    dialog.handleInput("p");
    worker.emit("message", { type: "call", method: "agent", callId: 9, payload: { prompt: "never run", label: "queued", agentType: "Explore" } });
    await drain();
    expect(fake.runs).toHaveLength(0);
    dialog.handleInput("\r");
    expect(screen(dialog)).toContain("s skip"); expect(screen(dialog)).not.toContain("r retry");
    dialog.handleInput("r"); await drain(); expect(fake.runs).toHaveLength(0);
    dialog.handleInput("\t"); dialog.handleInput("s"); dialog.handleInput("x");
    expect(worker.terminate).not.toHaveBeenCalled(); // detail pane never mutates the run
    dialog.handleInput("\t"); dialog.handleInput("s"); await drain();
    expect(worker.postMessage).toHaveBeenCalledWith(expect.objectContaining({ type: "response", callId: 9, value: null }));
    dialog.handleInput("p"); await drain(); expect(fake.runs).toHaveLength(0);
    worker.emit("message", { type: "complete", resultJson: '"skipped result"' }); await drain();
    const notifications = app.ui.notify.mock.calls.length;
    for (const key of ["x", "p", "r", "s"]) dialog.handleInput(key);
    expect(app.ui.notify.mock.calls).toHaveLength(notifications);
    expect(worker.terminate).toHaveBeenCalledTimes(1);
    dialog.handleInput("\x1b"); dialog.handleInput("\x1b");
  }, "ESC");
  expect(JSON.stringify(started)).toContain("wf_");
});

it("uses registered steer/result and foreground resume callbacks with exact manager arguments", async () => {
  const app = await boot(); const spawn = vi.spyOn(AgentManager.prototype, "spawnAndWait");
  const pending = app.invoke("Agent", args("inline", { run_in_background: false, max_turns: 5 }));
  await drain();
  expect(spawn.mock.calls[0].slice(0, 4)).toEqual([app.pi, app.ctx, "Explore", "Inspect inline"]);
  expect(spawn.mock.calls[0][4]).toMatchObject({ description: "inline task", maxTurns: 5 });
  // Observe the actual manager instance invoked by the registered callback.
  const id = (spawn.mock.contexts[0] as AgentManager).listAgents()[0].id;
  const steering = await app.invoke("steer_subagent", { agent_id: id, message: "new direction" });
  expect(JSON.stringify(steering)).toContain(`Steering message sent to agent ${id}`);
  expect(fake.runs[0].session.steer).toHaveBeenCalledWith("new direction");
  fake.runs[0].finish("inline result"); const result = await pending;
  expect(result.details.status).toBe("completed"); expect(JSON.stringify(result)).toContain("inline result");
  const resumed = app.invoke("Agent", args("inline", { resume: id, run_in_background: false, prompt: "follow-up" }));
  await drain(); expect(fake.resumes[0]).toMatchObject({ session: fake.runs[0].session, prompt: "follow-up" });
  fake.resumes[0].finish("continued result"); expect(JSON.stringify(await resumed)).toContain("continued result");
  const calls = fake.runs[0].session.steer.mock.calls.length;
  await app.invoke("steer_subagent", { agent_id: id, message: "too late" });
  expect(fake.runs[0].session.steer.mock.calls).toHaveLength(calls);
});

it.each(["method", "name", "description", "tools", "model", "thinking", "prompt"])("cancels manual creation at %s without a file or runner", async boundary => {
  const app = await boot();
  const steps: Step[] = ["Create new agent", "Project"];
  if (boundary === "method") steps.push("ESC");
  else {
    steps.push("Manual configuration");
    app.inputs.push(boundary === "name" ? undefined : "cancelled");
    if (boundary !== "name") {
      app.inputs.push(boundary === "description" ? undefined : "description");
      if (boundary !== "description") {
        steps.push(boundary === "tools" ? "ESC" : "none");
        if (boundary !== "tools") {
          steps.push(boundary === "model" ? "ESC" : "inherit");
          if (boundary !== "model") {
            steps.push(boundary === "thinking" ? "ESC" : "inherit");
            if (boundary === "prompt") app.editors.push(undefined);
          }
        }
      }
    }
  }
  await app.menu(...steps);
  expect(existsSync(join(dir, ".pi/agents/cancelled.md"))).toBe(false); expect(fake.runs).toEqual([]);
});

it("dispatches generated creation to faux runner with bypassQueue and preserves manual overwrite cancellation", async () => {
  const app = await boot(); const spawn = vi.spyOn(AgentManager.prototype, "spawnAndWait");
  app.inputs.push("A fixture specialist", "generated");
  const generating = app.menu("Create new agent", "Project", "Generate");
  await drain();
  expect(spawn.mock.calls[0][4]).toMatchObject({ description: "Generate generated agent", maxTurns: 5, bypassQueue: true });
  expect(fake.runs[0].prompt).toContain(join(dir, ".pi/agents/generated.md"));
  // Simulate only the runner's output file, never the requested model turn.
  const path = join(dir, ".pi/agents/generated.md");
  writeFileSync(path, "---\ndescription: Generated fixture\n---\nFixture instructions.");
  fake.runs[0].finish(); await generating;
  expect(app.ui.notify).toHaveBeenCalledWith(`Created ${path}`, "info");
  const original = readFileSync(path, "utf8");
  app.inputs.push("generated", "replacement", "read, grep", "fake/local");
  app.editors.push("Replacement instructions"); app.confirmations.push(false);
  await app.menu("Create new agent", "Project", "Manual", "custom", "custom", "high");
  expect(readFileSync(path, "utf8")).toBe(original);
  expect(fake.runs).toHaveLength(1);
});

it("does not let a completed workflow child retry or skip while sibling work remains live", async () => {
  const app = await boot();
  await app.invoke("SubagentWorkflow", { script: 'export const meta = { name: "settled-child", description: "fixture" }; return 1;' });
  const worker = fake.workers[0];
  for (const [id, label] of [[1, "done"], [2, "running"]] as const) worker.emit("message", {
    type: "call", method: "agent", callId: id, payload: { prompt: `inspect ${label}`, label, agentType: "Explore" },
  });
  await drain(); fake.runs[0].finish("completed child evidence"); await drain();
  await app.menu("Workflows", dialog => {
    dialog.handleInput("\r");
    expect(screen(dialog)).not.toContain("r retry"); expect(screen(dialog)).not.toContain("s skip");
    dialog.handleInput("r"); dialog.handleInput("s");
    expect(fake.runs).toHaveLength(2); expect(fake.runs[1].options.signal.aborted).toBe(false);
    dialog.handleInput("\x1b"); dialog.handleInput("\x1b");
  }, "ESC");
});

it("reports faux runner failure and preserves the upstream disabled-isolation downgrade without a process", async () => {
  const app = await boot({ worktreeIsolation: false });
  expect(app.tools.get("Agent").parameters.properties).not.toHaveProperty("isolation");
  const downgraded = await app.invoke("Agent", args("downgraded", { isolation: "worktree" }));
  expect(downgraded.details.status).toBe("background");
  expect(worktree.createWorktree).not.toHaveBeenCalled(); expect(fake.runs).toHaveLength(1);
  expect(fake.runs[0].options.worktreeBase).toBeUndefined();
  fake.runs[0].finish(); await drain();
  const pending = app.invoke("Agent", args("failure", { run_in_background: false }));
  await drain(); fake.runs[1].finish("partial evidence", "fixture provider failed");
  const result = await pending;
  expect(result.details.status).toBe("error"); expect(JSON.stringify(result)).toContain("fixture provider failed");
  expect(app.pi.exec).not.toHaveBeenCalled();
});

it("keeps reserved/non-agent/headless mention input out of direct execution", async () => {
  const app = await boot({ agentMentions: "direct" });
  for (const text of ["plain prompt", "@Explore", "@src/fixture.ts inspect", "@unknown inspect"]) {
    expect(await app.fire("input", { text, source: "interactive" })).toEqual({ action: "continue" });
  }
  const images = [{ type: "image", data: "fixture", mimeType: "image/png" }];
  expect(await app.fire("input", { text: "@main inspect", images, source: "interactive" })).toEqual({ action: "transform", text: "inspect", images });
  app.ctx.mode = "print";
  expect(await app.fire("input", { text: "@Explore inspect", source: "interactive" })).toEqual({ action: "continue" });
  expect(fake.runs).toHaveLength(0); expect(fake.clones).toHaveLength(0);
});

