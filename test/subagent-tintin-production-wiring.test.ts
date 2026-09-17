import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { CombinedAutocompleteProvider, Container, TuiMainScreen, stripTerminalSequences, visibleWidth } from "@earendil-works/pi-tui";
import { CustomEditor, ToolExecutionComponent } from "@earendil-works/pi-coding-agent";
import registerBundledExtensions from "../packages/extension-core/runtime/src/registerBundledExtensions";
import { getAllBundledExtensionIds } from "../packages/feature-flags/src/registry";
import { runCliWithApp } from "../apps/tui/src/cli/runCliWithApp";
import { PromptlineEditor } from "../packages/extension-core/neo-editor/src/features/promptline/PromptlineEditor";
import * as compactTools from "../packages/extension-core/tron/src/compact-tool-lines/createCompactToolDefinition";
import { FffRuntime } from "../packages/extension-core/fff/src/runtime/FffRuntime";

// Only external model, worker-process and native-search boundaries are replaced.
// Registry, settings, Neo frame/status, FFF/mention wrappers, fleet, workflow
// runtime, modal components, Tron adapters and Pi TUI remain production code.
const model = vi.hoisted(() => ({ runs: [] as any[], workers: [] as any[] }));
// Process boundary only: feed the real workflow host protocol deterministically.
// No script, child process, worktree or autonomous agent is launched.
vi.mock("node:worker_threads", async original => {
  const { EventEmitter } = await import("node:events");
  return { ...await original<object>(), Worker: class extends EventEmitter {
    postMessage = vi.fn();
    terminate = vi.fn(async () => 0);
    constructor() { super(); model.workers.push(this); }
  } };
});
vi.mock("../packages/extension-core/subagent-tintin/src/agent-runner.js", async original => ({
  ...await original<object>(),
  runAgent: vi.fn((_ctx, _type, _prompt, options) => new Promise(resolve => {
    const session = { messages: [], subscribe: () => () => {}, dispose() {}, abort: async () => {}, steer: async () => {}, sessionManager: { getSessionFile: () => undefined } };
    model.runs.push({ finish: (text = "scripted answer") => resolve({ responseText: text, session }), options });
    queueMicrotask(() => options.onSessionCreated?.(session));
  })),
}));
const id = (text: string) => text;
const theme: any = { fg: (_: string, text: string) => text, bg: (_: string, text: string) => text, bold: id, italic: id, strikethrough: id, getFgAnsi: () => "", getBgAnsi: () => "" };
const editorTheme: any = { borderColor: id, selectList: { selectedPrefix: id, selectedText: id, description: id, scrollInfo: id, noMatch: id } };
let directory: string;
let shutdown: (() => Promise<void>) | undefined;
beforeEach(() => {
  vi.useFakeTimers({ toFake: ["Date", "setInterval", "clearInterval", "setTimeout", "clearTimeout"] });
  vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));
  directory = mkdtempSync("/tmp/nx-production-wiring-");
  for (const path of ["config", "agent", ".pi"]) mkdirSync(join(directory, path), { recursive: true });
  vi.stubEnv("NEXUS_CONFIG_DIR", join(directory, "config"));
  vi.stubEnv("PI_CODING_AGENT_DIR", join(directory, "agent"));
  vi.stubEnv("HOME", directory);
  vi.stubEnv("TMPDIR", directory);
  vi.spyOn(compactTools, "createCompactToolDefinition");
  vi.spyOn(process, "cwd").mockReturnValue(directory);
  model.runs.length = 0; model.workers.length = 0;
  (globalThis as any)[Symbol.for("@earendil-works/pi-coding-agent:theme")] = theme;
  // External native search boundary; no index/database is initialized.
  vi.spyOn(FffRuntime.prototype, "searchFileCandidates").mockResolvedValue([{ item: { relativePath: "fixture.ts", absolutePath: join(directory, "fixture.ts"), fileName: "fixture.ts" }, score: { matchType: "exact" } }] as any);
  vi.spyOn(FffRuntime.prototype, "trackQuery").mockResolvedValue();
  writeFileSync(join(directory, "fixture.ts"), "export const fixture = 'file preview';\n");
});
afterEach(async () => {
  await shutdown?.(); shutdown = undefined;
  vi.useRealTimers(); vi.restoreAllMocks(); vi.unstubAllEnvs();
  rmSync(directory, { recursive: true, force: true });
});

async function boot({ argv = [], disabled = [], configDisabled = [], settings = {} }: { argv?: string[]; disabled?: string[]; configDisabled?: string[]; settings?: object } = {}) {
  // Disable unrelated extensions through real persisted configuration, not mocks.
  // This is a focused bundled-registration boot, not a claim of full app startup.
  const owners = ["subagent-tintin", "neo-editor", "tron", "fff"];
  writeFileSync(join(directory, "config/config.json"), JSON.stringify({ featureFlags: Object.fromEntries(getAllBundledExtensionIds().filter(name => !owners.includes(name) || configDisabled.includes(name)).map(name => [name, false])) }));
  writeFileSync(join(directory, ".pi/subagents.json"), JSON.stringify({ schedulingEnabled: false, outputTranscript: false, maxConcurrent: 1, ...settings }));
  const callbacks = new Map<string, Function[]>(), listeners = new Map<string, Set<Function>>();
  const tools: any[] = [], commands = new Map<string, any>(), widgets = new Map<string, any>();
  const wrappers: Function[] = [];
  let input!: (data: string) => void;
  let output = "";
  const terminal: any = { columns: 120, rows: 35, kittyProtocolActive: true, start: (fn: any) => { input = fn; }, stop() {}, drainInput: async () => {}, write: (text: string) => { output += text; }, moveBy() {}, hideCursor() {}, showCursor() {}, clearLine() {}, clearFromCursor() {}, clearScreen() {}, setTitle() {}, setProgress() {} };
  const tui = new TuiMainScreen(terminal);
  const keybindingsPath = new URL("../node_modules/@earendil-works/pi-coding-agent/dist/core/keybindings.js", import.meta.url);
  const { KeybindingsManager } = await import(keybindingsPath.href);
  const keys = new KeybindingsManager();
  const transcript = new Container(), above = new Container(), prompt = new Container(), below = new Container();
  for (const component of [transcript, above, prompt, below]) tui.addChild(component);
  let editor: any = new CustomEditor(tui, editorTheme, keys);
  prompt.addChild(editor);
  const autocomplete = () => {
    let provider: any = new CombinedAutocompleteProvider([], directory, null);
    for (const wrap of wrappers) provider = wrap(provider);
    editor.setAutocompleteProvider(provider);
  };
  autocomplete();
  const ui: any = {
    theme, notify: vi.fn(), setStatus: vi.fn(), setWorkingMessage: vi.fn(), setFooter: vi.fn(),
    getEditorText: () => editor.getText(), setEditorText: (value: string) => editor.setText(value),
    setEditorComponent: (factory: any) => { prompt.clear(); editor = factory(tui, editorTheme, keys); prompt.addChild(editor); autocomplete(); tui.setFocus(editor); },
    addAutocompleteProvider: (wrap: Function) => { wrappers.push(wrap); autocomplete(); },
    setWidget: (name: string, factory: any, options: any) => {
      const previous = widgets.get(name); if (previous) { above.removeChild(previous); below.removeChild(previous); widgets.delete(name); }
      if (factory) { const component = typeof factory === "function" ? factory(tui, theme) : { render: () => factory, invalidate() {} }; widgets.set(name, component); (options?.placement === "belowEditor" ? below : above).addChild(component); }
      tui.requestRender();
    },
    onTerminalInput: (fn: any) => tui.addInputListener(fn),
    custom: (factory: any, options: any) => new Promise(resolve => {
      let handle: any;
      const component = factory(tui, theme, keys, (result: any) => { handle.hide(); resolve(result); });
      handle = tui.showOverlay(component, options?.overlayOptions ?? { width: "90%" });
    }),
  };
  const events = { on: (name: string, fn: Function) => { if (!listeners.has(name)) listeners.set(name, new Set()); listeners.get(name)!.add(fn); return () => listeners.get(name)!.delete(fn); }, emit: (name: string, data: any) => { for (const fn of listeners.get(name) ?? []) fn(data); } };
  const pi: any = {
    events, on: (name: string, fn: Function) => callbacks.set(name, [...callbacks.get(name) ?? [], fn]),
    registerTool: (tool: any) => tools.push(tool), registerCommand: (name: string, command: any) => commands.set(name, command), registerShortcut: vi.fn(), registerFlag: vi.fn(), registerEntryRenderer: vi.fn(), registerMessageRenderer: vi.fn(),
    getFlag: () => undefined, getThinkingLevel: () => "off", setThinkingLevel: vi.fn(), getSessionName: () => "Production wiring", getCommands: () => [], getAllTools: () => tools, getActiveTools: () => tools.map(t => t.name), setActiveTools: vi.fn(),
    sendMessage: vi.fn(), appendEntry: vi.fn(),
    // Process boundary: never execute git, worktrees, shell or paid providers.
    exec: vi.fn(async () => ({ code: 1, stdout: "", stderr: "disabled in scripted terminal" })),
  };
  const ctx: any = { cwd: directory, hasUI: true, mode: "tui", ui, model: { id: "test-model", provider: "test-provider", contextWindow: 128000 }, sessionManager: { getLeafId: () => undefined, getSessionId: () => "scripted-session", getSessionFile: () => undefined, getBranch: () => [], getEntries: () => [], getSessionDir: () => directory }, modelRegistry: { getAvailable: () => [], getAll: () => [] }, getSystemPrompt: () => "Scripted terminal", getContextUsage: () => undefined, isIdle: () => true };
  const fire = async (name: string, event = {}) => { for (const fn of callbacks.get(name) ?? []) await fn(event, ctx); };
  // Use the actual CLI's normal/minimal/-m/disable interpretation. Skip only
  // unrelated owners, whose services and menus are outside this bead.
  const skip = getAllBundledExtensionIds().filter(name => !owners.includes(name));
  const cliArgs = [...argv, ...(disabled.length ? ["--disable-features", disabled.join(",")] : [])];
  expect(await runCliWithApp(cliArgs, { runApp: async (_args, overrides) => {
    await registerBundledExtensions(pi, skip, overrides?.disabledFeatures, overrides?.enabledFeatures);
  } })).toBe(0);
  shutdown = async () => { await fire("session_shutdown"); tui.stop(); };
  await fire("session_start", { reason: "test" });
  tui.setFocus(editor); tui.start();
  const drain = async () => { for (let i = 0; i < 8; i++) await new Promise(resolve => setImmediate(resolve)); };
  const settle = async () => { await drain(); tui.renderNow(); };
  await settle();
  const launch = (name: string, args: any) => {
    const tool = tools.find(tool => tool.name === name);
    const callId = `call-${transcript.children.length}`;
    const row = new ToolExecutionComponent(name, callId, args, {}, tool, tui, directory);
    transcript.addChild(row);
    const completed = (async () => {
      await fire("tool_execution_start", { toolName: name, toolCallId: callId, args });
      const result = await tool.execute(callId, args, undefined, (partial: any) => row.updateResult({ ...partial, isError: false }), ctx);
      row.updateResult({ ...result, isError: false });
      await settle();
      return { result, row };
    })();
    return { row, completed };
  };
  const invoke = (name: string, args: any) => launch(name, args).completed;
  return { launch, drain, invoke, tui, terminal, tools, commands, widgets, wrappers, events, listeners, pi, ctx, ui, fire, settle, send: (data: string) => input(data), get editor() { return editor; }, output: () => stripTerminalSequences(output), screen: (): string => (tui as any).compositeOverlays(tui.render(terminal.columns), terminal.columns, terminal.rows).slice(-terminal.rows).map(stripTerminalSequences).join("\n").replace(/nx-production-wiring-[A-Za-z0-9]{6}/g, "nx-production-wiring-XXXXXX").replace(/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{3}/g, "AGENT-ID-REDACTED"), transcript, above, below };
}

it.each([{ argv: [] }, { argv: ["--minimal"] }, { argv: ["-m"] }])("registers real Tintin exactly once with argv %j", async ({ argv }) => {
  const app = await boot({ argv });
  for (const name of ["Agent", "SubagentWorkflow", "get_subagent_result", "steer_subagent"]) expect(app.tools.filter(tool => tool.name === name)).toHaveLength(1);
  for (const name of ["subagent_start", "subagent_prompt", "subagent_send", "subagent_read", "subagent_send_keys"]) expect(app.tools.map(tool => tool.name)).not.toContain(name);
  expect(app.editor).toBeInstanceOf(PromptlineEditor);
  expect(app.wrappers).toHaveLength(1);
  for (const name of ["Agent", "SubagentWorkflow", "get_subagent_result", "steer_subagent"]) {
    const original = vi.mocked(compactTools.createCompactToolDefinition).mock.calls.find(([tool]) => tool.name === name)![0];
    const registered = app.tools.find(tool => tool.name === name);
    expect(registered.execute).toBe(original.execute);
    expect(registered.parameters).toBe(original.parameters);
    expect(registered.renderResult).not.toBe(original.renderResult);
  }
  expect(app.screen()).toContain("test-model");
});

it.each(["config", "cli"])("disables Tintin through %s without disabling Neo/Tron", async source => {
  const app = await boot(source === "config" ? { configDisabled: ["subagent-tintin"] } : { disabled: ["subagent-tintin"] });
  for (const name of ["Agent", "SubagentWorkflow", "get_subagent_result", "steer_subagent"]) expect(app.tools.some(tool => tool.name === name)).toBe(false);
  expect(app.wrappers).toHaveLength(0);
  expect(app.editor).toBeInstanceOf(PromptlineEditor);
  expect(app.tools.some(tool => tool.name === "bash")).toBe(true);
});

const agentArgs = (name: string) => ({ subagent_type: "Explore", name, description: `${name} task`, prompt: `Inspect ${name}`, run_in_background: true });

it.each(["neo-editor", "tron"])("retains execution with %s independently disabled", async disabled => {
  const app = await boot({ disabled: [disabled] });
  expect(app.editor instanceof PromptlineEditor).toBe(disabled !== "neo-editor");
  expect(vi.mocked(compactTools.createCompactToolDefinition).mock.calls.some(([tool]) => tool.name === "Agent")).toBe(disabled !== "tron");
  const { result } = await app.invoke("Agent", agentArgs("scout"));
  expect(result.details.status).toBe("background");
  expect(model.runs).toHaveLength(1);
  model.runs[0].finish(); await app.settle(); await vi.advanceTimersByTimeAsync(600); await app.settle();
  expect(app.pi.sendMessage).toHaveBeenCalled();
});

it("cohabits real frame, metadata, fleet, FFF references and Tron transcript through idle transitions", async () => {
  const app = await boot();
  const first = await app.invoke("Agent", agentArgs("scout"));
  const second = await app.invoke("Agent", agentArgs("reviewer"));
  const workflow = await app.invoke("SubagentWorkflow", { script: 'export const meta = { name: "integration-flow", description: "Scripted integration" }; return "worker boundary";' });
  expect(model.workers).toHaveLength(1);
  const worker = model.workers[0];
  const beforeWorkflowProgress = app.output().length;
  worker.emit("message", { type: "progress", entries: [{ type: "workflow_agent", index: 0, label: "workflow-scan", state: "start" }] });
  await vi.advanceTimersByTimeAsync(600); await app.drain();
  expect(app.output().slice(beforeWorkflowProgress)).toContain("0/1 agent");
  expect(app.screen()).toContain("integration-flow");
  expect(app.screen()).toContain("0/1 agent");
  workflow.row.setExpanded(true);
  expect(workflow.row.render(120).map(stripTerminalSequences).join("\n")).toContain("workflow-scan");
  workflow.row.setExpanded(false);
  expect(model.runs).toHaveLength(1);
  expect(app.screen()).toContain("1 running · 1 queued");
  expect(app.screen()).toContain("scout task");
  expect(app.screen()).toContain("reviewer task");
  expect(app.above.children).toHaveLength(0);
  expect(app.below.children).toHaveLength(1);
  const lines = app.screen().split("\n");
  expect(lines.findIndex(line => line.includes("test-model"))).toBeLessThan(lines.findIndex(line => line.includes("Alt+Shift+F")));
  expect(lines.every(line => visibleWidth(line) <= 120)).toBe(true);
  await expect(app.screen()).toMatchFileSnapshot("./snapshots/tintin-production/queued.txt");
  app.send("@"); await app.settle();
  expect(app.tui.hasOverlay()).toBe(true);
  const preview = app.screen();
  expect(app.output()).toContain("References");
  expect(preview).toContain("References");
  expect(preview).toContain("Action: send message");
  expect(preview).toContain("fixture.ts");
  await expect(preview).toMatchFileSnapshot("./snapshots/tintin-production/references.txt");
  for (let i = 0; i < 4; i++) app.send("\x1b[B");
  await app.settle();
  expect(app.screen()).toContain("export const fixture = 'file preview'");
  expect(app.screen()).not.toContain("Action: send message");
  await expect(app.screen()).toMatchFileSnapshot("./snapshots/tintin-production/file-preview.txt");
  for (let i = 0; i < 4; i++) app.send("\x1b[A");
  app.send("\r"); await app.settle();
  expect(app.editor.getText()).toContain("@scout");
  expect(model.runs).toHaveLength(1);
  expect(FffRuntime.prototype.trackQuery).not.toHaveBeenCalled();
  app.editor.setText("");
  app.send("\x1b[102;4u"); app.send("\x1b[B"); app.send("\r"); await app.settle();
  expect(app.tui.hasOverlay()).toBe(true);
  expect(app.screen()).toContain("integration-flow");
  expect(app.screen()).toContain("workflow-scan");
  await expect(app.screen()).toMatchFileSnapshot("./snapshots/tintin-production/workflow-modal.txt");
  app.send("\x1b"); await app.settle();
  expect(app.tui.getFocusedComponent()).toBe(app.editor);
  app.send("\x1b");
  app.send("\x1b[102;4u"); app.send("\x1b[B"); app.send("\x1b[B"); app.send("\r"); await app.settle();
  expect(app.tui.hasOverlay()).toBe(true);
  const conversation = app.tui.getFocusedComponent()!;
  expect(conversation.render(110).map(stripTerminalSequences).join("\n")).toContain("scout");
  await expect(app.screen()).toMatchFileSnapshot("./snapshots/tintin-production/conversation-modal.txt");
  app.send("\x1b"); await app.settle();
  expect(app.tui.getFocusedComponent()).toBe(app.editor);
  app.send("\x1b");
  app.editor.setText("multiline first\nmultiline second\nmultiline third");
  app.terminal.columns = 64; app.terminal.rows = 12;
  await app.settle();
  const resized = app.screen();
  expect(resized).toContain("multiline third");
  expect(resized).toContain("test-model");
  expect(resized.split("\n").every(line => visibleWidth(line) <= 64)).toBe(true);
  expect(app.editor.render(64).length + app.below.render(64).length).toBeLessThanOrEqual(10);
  await expect(resized).toMatchFileSnapshot("./snapshots/tintin-production/multiline-resized.txt");
  app.terminal.columns = 120; app.terminal.rows = 35; app.editor.setText("");
  const beforeIdle = app.output().length;
  model.runs[0].finish("scout completed");
  await app.drain(); await vi.advanceTimersByTimeAsync(600); await app.drain();
  expect(app.output().slice(beforeIdle)).toContain("1 running");
  expect(model.runs).toHaveLength(2);
  expect(app.screen()).toContain("1 running");
  expect(app.screen()).not.toContain("1 queued");
  model.runs[1].finish("review completed");
  const beforeWorkflowCompletion = app.output().length;
  worker.emit("message", { type: "progress", entries: [{ type: "workflow_agent", index: 0, label: "workflow-scan", state: "done" }] });
  worker.emit("message", { type: "complete", resultJson: JSON.stringify("workflow verified") });
  await app.drain(); await vi.advanceTimersByTimeAsync(600); await app.drain();
  expect(app.output().slice(beforeWorkflowCompletion)).toContain("done");
  workflow.row.setExpanded(true);
  expect(app.screen()).toContain("workflow verified");
  expect(worker.terminate).toHaveBeenCalledTimes(1);
  expect(app.below.render(120).join("\n")).not.toContain("running");
  expect(app.pi.sendMessage).toHaveBeenCalled();
  expect(first.result.details.agentId).toBeTruthy(); expect(second.result.details.agentId).toBeTruthy();
  await expect(app.screen()).toMatchFileSnapshot("./snapshots/tintin-production/completed.txt");
});

it.each([
  { label: "hidden", settings: { fleetView: false }, fleet: false, legacy: false },
  { label: "legacy", settings: { fleetView: false, widgetMode: "all" }, fleet: false, legacy: true },
  { label: "dormant-legacy", settings: { fleetView: true, widgetMode: "all" }, fleet: true, legacy: false },
])("keeps counts and contracts with $label surfaces and releases lifecycle resources", async ({ label, settings, fleet, legacy }) => {
  const app = await boot({ settings });
  const { result } = await app.invoke("Agent", agentArgs("scout"));
  await app.fire("session_start", { reason: "test" }); await app.settle();
  expect(app.wrappers).toHaveLength(1);
  expect(app.listeners.get("subagents:counts")?.size).toBe(1);
  expect(app.listeners.get("subagents:counts:request")?.size).toBe(1);
  expect(app.screen()).toContain("1 running");
  expect(app.screen().includes("Alt+Shift+F")).toBe(fleet);
  expect(app.above.children.length).toBe(legacy ? 1 : 0);
  const provider = app.editor.promptAutocompleteProvider;
  const suggestions = await provider.getSuggestions(["@"], 0, 1, { signal: new AbortController().signal });
  expect(suggestions.items.filter((item: any) => item.value === "@scout")).toHaveLength(1);
  const fileIndex = suggestions.items.findIndex((item: any) => item.reference.kind === "file");
  expect(fileIndex).toBeGreaterThan(0);
  expect(suggestions.items.slice(0, fileIndex).every((item: any) => item.reference.kind === "agent")).toBe(true);
  await expect(app.screen()).toMatchFileSnapshot(`./snapshots/tintin-production/${label}.txt`);
  model.runs[0].finish("retrievable answer"); await app.drain();
  const retrieval = await app.invoke("get_subagent_result", { agent_id: result.details.agentId });
  expect(JSON.stringify(retrieval.result)).toContain("retrievable answer");
  await app.fire("session_shutdown"); await app.drain();
  expect(app.listeners.get("subagents:counts")?.size).toBe(0);
  expect(app.listeners.get("subagents:counts:request")?.size).toBe(0);
  expect((app.tui as any).inputListeners.size).toBe(0);
  expect(app.above.children).toHaveLength(0);
  expect(app.below.render(120)).toEqual([]);
  expect((globalThis as any)[Symbol.for("pi-subagents:manager")]).toBeUndefined();
  const requests = vi.spyOn(app.tui, "requestRender");
  app.events.emit("subagents:counts", { sessionId: "scripted-session", running: 99, queued: 99 });
  await vi.advanceTimersByTimeAsync(1200); await app.drain();
  expect(requests).not.toHaveBeenCalled();
  expect(vi.getTimerCount()).toBe(0);
});

it("streams foreground activity and queued-to-completed results through the registered Tron contract", async () => {
  const app = await boot({ settings: { maxConcurrentForeground: 1 } });
  const first = app.launch("Agent", { ...agentArgs("scout"), run_in_background: false });
  const second = app.launch("Agent", { ...agentArgs("reviewer"), run_in_background: false });
  await app.settle();
  expect(model.runs).toHaveLength(1);
  expect(app.screen()).toContain("1 running · 1 queued");
  expect(second.row.render(120).map(stripTerminalSequences).join("\n")).toMatch(/[Qq]ueued/);
  model.runs[0].options.onToolActivity({ type: "start", toolName: "read" });
  model.runs[0].options.onTextDelta("scanning", "scanning production sources");
  await app.drain();
  expect(first.row.render(120).map(stripTerminalSequences).join("\n")).toContain("read");
  await expect(app.screen()).toMatchFileSnapshot("./snapshots/tintin-production/foreground-active.txt");
  model.runs[0].finish("first detailed result");
  const firstResult = await first.completed;
  expect(firstResult.result.details.status).toBe("completed");
  await app.drain();
  expect(model.runs).toHaveLength(2);
  expect(app.screen()).not.toContain("1 queued");
  model.runs[1].finish("second detailed result");
  const secondResult = await second.completed;
  expect(secondResult.result.details.status).toBe("completed");
  expect(app.screen().match(/Done/g)).toHaveLength(2);
  first.row.setExpanded(true); second.row.setExpanded(true);
  expect(app.screen()).toContain("first detailed result");
  expect(app.screen()).toContain("second detailed result");
  expect(app.below.render(120).join("\n")).not.toContain("running");
  await expect(app.screen()).toMatchFileSnapshot("./snapshots/tintin-production/foreground-completed.txt");
});

it("shuts down active worker/model boundaries without stale UI updates or subscriptions", async () => {
  const app = await boot({ settings: { fleetView: false, widgetMode: "all" } });
  await app.invoke("Agent", agentArgs("scout"));
  await app.invoke("SubagentWorkflow", { script: 'export const meta = { name: "cleanup", description: "still active" }; return 1;' });
  await app.fire("session_shutdown"); await app.drain();
  expect(model.workers[0].terminate).toHaveBeenCalledTimes(1);
  expect([...app.listeners.values()].every(set => set.size === 0)).toBe(true);
  expect((app.tui as any).inputListeners.size).toBe(0);
  model.runs[0].finish("late completion");
  await app.drain(); await vi.advanceTimersByTimeAsync(2000); await app.drain();
  expect(app.above.children).toHaveLength(0);
  expect(app.below.render(120)).toEqual([]);
  expect(vi.getTimerCount()).toBe(0);
});
