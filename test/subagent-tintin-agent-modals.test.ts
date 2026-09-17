import { afterEach, describe, expect, it, vi } from "vitest";
import { CustomEditor } from "@earendil-works/pi-coding-agent";
import { Editor, TuiMainScreen, visibleWidth } from "@earendil-works/pi-tui";
import { FleetList } from "../packages/extension-core/subagent-tintin/src/ui/fleet-list";
import { ConversationViewer } from "../packages/extension-core/subagent-tintin/src/ui/conversation-viewer";
import { AgentSelectDialog, AgentSettingsDialog } from "../packages/extension-core/subagent-tintin/src/ui/shared-dialog";
import { showSchedulesMenu } from "../packages/extension-core/subagent-tintin/src/ui/schedule-menu";
import { selectAgentOption } from "../packages/extension-core/subagent-tintin/src/ui/shared-dialog";
import { WorkflowDialog } from "../packages/extension-core/subagent-tintin/src/ui/workflow-dialog";
const theme = { fg: (_: string, s: string) => s, bold: (s: string) => s };
const cleanup: (() => void)[] = [];
afterEach(() => cleanup.splice(0).forEach(fn => fn()));
const kb = { matches: (data: string, id: string) => ({ "tui.select.down": "D", "tui.select.up": "U", "tui.select.confirm": "O", "tui.select.cancel": "Q", "tui.input.submit": "S" } as Record<string, string>)[id] === data };
const record = () => ({ id: "a", status: "running", type: "Explore", description: "agent", startedAt: 1, toolUses: 0 });

describe("explicit fleet keyboard ownership", () => {
  it("scripted TuiMainScreen smoke routes terminal input through nested overlays and restores fleet focus", () => {
    let send!: (data: string) => void;
    let output = "";
    const terminal: any = { columns: 100, rows: 24, kittyProtocolActive: true,
      start: (input: (data: string) => void) => { send = input; }, stop() {}, drainInput: async () => {},
      write: (s: string) => { output += s; }, moveBy() {}, hideCursor() {}, showCursor() {}, clearLine() {}, clearFromCursor() {}, clearScreen() {}, setTitle() {}, setProgress() {},
    };
    const tui = new TuiMainScreen(terminal);
    const editorKeys: string[] = [];
    const editor = Object.assign(Object.create(CustomEditor.prototype), { render: () => ["NEO prompt"], invalidate() {}, handleInput: (data: string) => editorKeys.push(data) });
    tui.addChild(editor); tui.setFocus(editor);
    const ui: any = { getEditorText: () => "", onTerminalInput: (fn: any) => tui.addInputListener(fn), setWidget: (_: string, factory: any) => { if (factory) tui.addChild(factory(tui, theme)); }, notify() {} };
    const fleet = new FleetList({ listAgents: () => [record()] } as any, new Map());
    fleet.setUICtx(ui); fleet.update(); tui.start(); tui.renderNow();
    cleanup.push(() => { fleet.dispose(); tui.stop(); });
    send("\x1b[B"); expect(editorKeys).toEqual(["\x1b[B"]);
    send("\x1b[102;4u"); send("\x1b[B");
    const first = new AgentSelectDialog(theme, "Agents", ["one", "two"], undefined, vi.fn());
    const h1 = tui.showOverlay(first, { width: 70 });
    const picked = vi.fn();
    const h2 = tui.showOverlay(new AgentSelectDialog(theme, "Nested settings", ["off", "on"], undefined, picked), { width: 60 });
    send("\x1b[B"); send("\r"); expect(picked).toHaveBeenCalledWith("on");
    tui.renderNow(); expect(output).toContain("Nested settings");
    h2.hide(); expect(tui.getFocusedComponent()).toBe(first);
    h1.hide(); expect(tui.getFocusedComponent()).toBe(editor);
    send("\x1b"); send("/"); expect(editorKeys).toEqual(["\x1b[B", "/"]);
  });
  it("never steals editor arrows, history, triggers, submit or cancel, fails closed and suspends through nested overlays", async () => {
    const editor = Object.assign(Object.create(CustomEditor.prototype), { keybindings: kb });
    const tui: any = { terminal: { rows: 24 }, focusedComponent: editor, requestRender: vi.fn(), hasOverlay: () => overlays > 0 };
    let overlays = 0;
    let text = "";
    let render: any;
    let close!: () => void;
    const open = vi.fn(() => new Promise<void>(resolve => { close = resolve; }));
    const ui: any = { getEditorText: () => text, onTerminalInput: () => () => {}, setWidget: (_: string, factory: any) => { if (factory) render = factory(tui, theme); }, notify: vi.fn() };
    const fleet = new FleetList({ listAgents: () => [] } as any, new Map());
    cleanup.push(() => fleet.dispose()); fleet.setUICtx(ui);
    fleet.setWorkflowSource(() => [{ id: "w", name: "run", status: "running", doneCount: 0, totalCount: 1, startedAt: 1, tokens: 0 }], open);
    fleet.update(); render.render(100);
    for (const key of ["\x1b[A", "\x1b[B", "\x1b[C", "\x1b[D", "@", "/", "\r", "\x1b", "\x10"]) expect(fleet.handleKey(key)).toBeUndefined();
    for (const focus of [null, undefined, {}, Object.create(Editor.prototype)]) {
      tui.focusedComponent = focus; expect(fleet.handleKey("\x1b[102;4u")).toBeUndefined();
    }
    tui.focusedComponent = editor;
    text = "@"; expect(fleet.handleKey("\x1b[102;4u")).toBeUndefined(); text = "";
    expect(fleet.handleKey("\x1b[102;4:3u")).toBeUndefined();
    expect(fleet.handleKey("\x1b[102;4u")).toEqual({ consume: true });
    expect(fleet.handleKey("D")).toEqual({ consume: true });
    overlays = 2;
    for (const key of ["D", "O", "Q", "\x1b[B", "\r", "\x1b"]) expect(fleet.handleKey(key)).toBeUndefined();
    overlays--; expect(fleet.handleKey("Q")).toBeUndefined(); overlays--;
    fleet.handleKey("O"); expect(open).toHaveBeenCalledWith("w");
    expect(fleet.handleKey("Q")).toBeUndefined(); close(); await Promise.resolve();
    expect(fleet.handleKey("Q")).toEqual({ consume: true });
    expect(fleet.handleKey("\r")).toBeUndefined();
  });
});

describe("shared live dialogs", () => {
  it("schedule gating, inspection and cancellation remain operational through the shared selector", async () => {
    const removeJob = vi.fn(); let active = false; let calls = 0;
    const job = { id: "job", name: "Daily", enabled: true, schedule: "0 9 * * *", scheduleType: "cron", subagent_type: "Explore", prompt: "Review", createdAt: "2026-01-01", runCount: 0 };
    const scheduler: any = { isActive: () => active, list: () => [job], getNextRun: () => undefined, removeJob };
    const ui: any = { notify: vi.fn(), select: vi.fn(), custom: async (factory: any) => {
      let result: any;
      const dialog = factory({ terminal: { rows: 30 }, requestRender() {} }, theme, undefined, (value: any) => { result = value; });
      const lines = dialog.render(100).join("\n");
      if (calls++) { expect(lines).toContain("Daily"); dialog.handleInput("\x1b[B"); }
      dialog.handleInput("\r"); return result;
    } };
    await showSchedulesMenu({ ui } as any, scheduler); expect(ui.notify).toHaveBeenCalledWith("Scheduler is not active in this session.", "warning"); expect(calls).toBe(0);
    active = true; await showSchedulesMenu({ ui } as any, scheduler); expect(removeJob).toHaveBeenCalledWith("job"); expect(ui.select).not.toHaveBeenCalled();
    const remote: any = { custom: async () => undefined, select: vi.fn(async () => "remote") };
    expect(await selectAgentOption(remote, "Title", ["remote"])).toBe("remote");
  });
  it("settings cycle all values, numeric activation stays attached to the selected id, and remapped paging stays visible", () => {
    const tui: any = { terminal: { rows: 14 }, requestRender: vi.fn() };
    const change = vi.fn(), done = vi.fn();
    const dialog = new AgentSettingsDialog(tui, theme, "Settings", [
      { id: "mentions", label: "Mentions", currentValue: "off", values: ["off", "on"] },
      { id: "numeric", label: "Max turns", currentValue: "5", values: ["5", "10"] },
    ], kb, change, done, id => id === "numeric");
    dialog.handleInput("O"); expect(change).toHaveBeenLastCalledWith("mentions", "on");
    dialog.handleInput("U"); // wrap to numeric, no duplicated selection tracker
    expect(dialog.render(80).join("\n")).toContain("❯ Max turns: 5");
    dialog.handleInput("O"); expect(change).toHaveBeenLastCalledWith("numeric", "5");
    dialog.handleInput("\x1b[13;1:3u"); expect(change).toHaveBeenCalledTimes(2);
    dialog.handleInput("Q"); expect(done).toHaveBeenCalled();
  });

  it("workflow drill-down preserves skip/retry/conversation eligibility and isolates scrolling detail keys", () => {
    const tui: any = { terminal: { rows: 30 }, requestRender: vi.fn() };
    const entry = { type: "workflow_agent", index: 7, state: "progress", label: "child", recordId: "a", startedAt: 1, promptPreview: Array.from({ length: 30 }, (_, i) => `prompt ${i}`).join("\n"), resultPreview: "final outcome" };
    const source: any = { task: { status: "running", workflowName: "inspect", startTime: 1 }, progress: [entry], agentCount: 1 };
    const actions = { onSkipAgent: vi.fn(), onRetryAgent: vi.fn(), onOpenAgent: vi.fn(), onKill: vi.fn() };
    const dialog = new WorkflowDialog(tui, () => source, theme, vi.fn(), actions, 0, kb); cleanup.push(() => dialog.dispose());
    dialog.handleInput("r"); expect(actions.onRetryAgent).not.toHaveBeenCalled();
    dialog.handleInput("O"); dialog.handleInput("r"); dialog.handleInput("s"); dialog.handleInput("c");
    expect(actions.onRetryAgent).toHaveBeenCalledWith(7); expect(actions.onSkipAgent).toHaveBeenCalledWith(7); expect(actions.onOpenAgent).toHaveBeenCalledWith("a");
    source.progress.push({ ...entry, state: "done" });
    dialog.handleInput("\t"); dialog.handleInput("O"); dialog.render(100);
    dialog.handleInput("G"); expect(dialog.render(100).join("\n")).toContain("final outcome");
    dialog.handleInput("g"); dialog.handleInput("g"); expect(dialog.render(100).join("\n")).toContain("prompt 0");
    dialog.handleInput("\x04"); expect(dialog.render(100).join("\n")).not.toContain("prompt 0");
    dialog.handleInput("\x15"); expect(dialog.render(100).join("\n")).toContain("prompt 0");
    dialog.handleInput("x"); dialog.handleInput("r"); expect(actions.onKill).not.toHaveBeenCalled(); expect(actions.onRetryAgent).toHaveBeenCalledTimes(1);
    dialog.handleInput("Q"); dialog.handleInput("Q"); // detail -> list -> phases
    dialog.handleInput("f"); expect(dialog.render(100).join("\n")).toContain("running");
  });
  it("conversation updates, history scroll, composer isolation, release filtering, Markdown and stop eligibility survive", () => {
    const tui: any = { terminal: { rows: 30 }, requestRender: vi.fn() };
    let event!: () => void;
    const unsub = vi.fn();
    const session: any = { messages: [{ role: "user", content: "history" }], subscribe: (fn: () => void) => { event = fn; return unsub; } };
    const r: any = record(); const done = vi.fn(), stop = vi.fn(), steer = vi.fn(), markdown = vi.fn();
    const viewer = new ConversationViewer(tui, session, r, undefined, theme, done, stop, kb as any, steer, false, undefined, markdown);
    cleanup.push(() => viewer.dispose());
    expect(viewer.render(100).join("\n")).toContain("history");
    session.messages.push({ role: "toolResult", content: [{ type: "text", text: "live tool details" }] }); event();
    expect(tui.requestRender).toHaveBeenCalled(); expect(viewer.render(100).join("\n")).toContain("live tool details");
    viewer.handleInput("O");
    for (const key of ["x", "m", "j", "p", "r", "s", "/", "@"]) viewer.handleInput(key);
    viewer.handleInput("S"); expect(steer).toHaveBeenCalledWith("xmjprs/@"); expect(stop).not.toHaveBeenCalled(); expect(markdown).not.toHaveBeenCalled();
    viewer.handleInput("\x1b[120;1:3u"); viewer.handleInput("x"); expect(stop).not.toHaveBeenCalled();
    viewer.handleInput("x"); expect(stop).toHaveBeenCalledTimes(1);
    viewer.handleInput("m"); expect(markdown).toHaveBeenCalledWith("all");
    r.status = "completed"; viewer.handleInput("x"); viewer.handleInput("x"); expect(stop).toHaveBeenCalledTimes(1);
    for (const rows of [10, 14, 24]) { tui.terminal.rows = rows; const lines = viewer.render(50); expect(lines.length).toBeLessThanOrEqual(Math.floor(rows * .7)); expect(lines.every(line => visibleWidth(line) <= 50)).toBe(true); }
    viewer.handleInput("Q"); expect(done).toHaveBeenCalled(); viewer.dispose(); expect(unsub).toHaveBeenCalledTimes(1);
  });

  it("shared selectors honor configured controls, page/end, preview isolation and short-terminal budgets", () => {
    const done = vi.fn();
    const selector = new AgentSelectDialog(theme, "Jobs\njob details", Array.from({ length: 30 }, (_, i) => `job ${i}`), kb, done, () => 8);
    selector.render(60); selector.handleInput("D"); selector.handleInput("O"); expect(done).toHaveBeenLastCalledWith("job 1");
    selector.handleInput("\x1b[F"); expect(selector.render(60).join("\n")).toContain("job 29");
    selector.handleInput("\t"); selector.handleInput("O"); expect(done).toHaveBeenCalledTimes(1);
    expect(selector.render(60)).toHaveLength(8); selector.handleInput("Q"); expect(done).toHaveBeenCalledTimes(1);
    selector.handleInput("O"); expect(done).toHaveBeenLastCalledWith("job 29");
    selector.handleInput("Q"); expect(done).toHaveBeenLastCalledWith(undefined);
  });

  it("workflow reads live state and retains phase/detail navigation, filtering and run action eligibility", () => {
    const tui: any = { terminal: { rows: 24 }, requestRender: vi.fn() };
    const source: any = { task: { status: "running", workflowName: "live", startTime: 1 }, progress: [], agentCount: 0 };
    const actions = { onKill: vi.fn(), onPause: vi.fn(), onResume: vi.fn(), onSkipAgent: vi.fn(), onRetryAgent: vi.fn(), onOpenAgent: vi.fn() };
    const done = vi.fn(); const dialog = new WorkflowDialog(tui, () => source, theme, done, actions, 0, kb);
    cleanup.push(() => dialog.dispose());
    dialog.handleInput("p"); expect(actions.onPause).toHaveBeenCalledTimes(1);
    source.task.status = "paused"; dialog.handleInput("p"); expect(actions.onResume).toHaveBeenCalledTimes(1);
    dialog.handleInput("\x1b[120;1:3u"); expect(actions.onKill).not.toHaveBeenCalled();
    dialog.handleInput("x"); expect(actions.onKill).toHaveBeenCalledTimes(1);
    source.task.status = "completed"; source.task.workflowName = "updated";
    expect(dialog.render(80).join("\n")).toContain("updated");
    dialog.handleInput("x"); dialog.handleInput("p"); dialog.handleInput("r"); dialog.handleInput("s");
    expect(actions.onKill).toHaveBeenCalledTimes(1); expect(actions.onRetryAgent).not.toHaveBeenCalled(); expect(actions.onSkipAgent).not.toHaveBeenCalled();
    tui.terminal.rows = 10; expect(dialog.render(50).length).toBeLessThanOrEqual(7);
    dialog.handleInput("Q"); expect(done).toHaveBeenCalled();
  });
});
