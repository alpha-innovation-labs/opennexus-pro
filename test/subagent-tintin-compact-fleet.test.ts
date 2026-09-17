import { afterEach, describe, expect, it, vi } from "vitest";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { CustomEditor } from "@earendil-works/pi-coding-agent";
import { visibleWidth } from "@earendil-works/pi-tui";
import { FleetList } from "../packages/extension-core/subagent-tintin/src/ui/fleet-list";
import { AgentWidget } from "../packages/extension-core/subagent-tintin/src/ui/agent-widget";
import { BELOW_EDITOR_KEY, reportEditorRows, setBelowEditorSlot } from "../packages/extension-core/subagent-tintin/src/ui/below-editor-layout";
import { loadSettings, resolveAgentSurfaces, saveSettings } from "../packages/extension-core/subagent-tintin/src/settings";

const theme = { fg: (_: string, text: string) => text, bold: (s: string) => s };
const cleanup: (() => void)[] = [];
afterEach(() => { cleanup.splice(0).forEach(fn => fn()); vi.unstubAllEnvs(); });
function harness(rows = 24) {
  const tui = { terminal: { rows, columns: 100 }, requestRender: vi.fn(), focusedComponent: Object.create(CustomEditor.prototype) };
  const widgets = new Map<string, any>();
  let text = "";
  const ui: any = {
    setWidget(key: string, factory: any) { if (factory) widgets.set(key, factory(tui, theme)); else widgets.delete(key); },
    getEditorText: () => text,
    setStatus: vi.fn(), onTerminalInput: () => () => {}, notify: vi.fn(), custom: vi.fn(),
  };
  const records: any[] = [];
  const manager: any = { listAgents: () => records, abort: vi.fn(), steer: vi.fn() };
  const fleet = new FleetList(manager, new Map());
  fleet.setUICtx(ui);
  cleanup.push(() => fleet.dispose());
  const metadata = () => setBelowEditorSlot(ui, "metadata", () => ({ render: () => ["NEO"], invalidate() {} }));
  return { tui, widgets, ui, records, manager, fleet, metadata, setText: (s: string) => { text = s; }, render: (width = 100): string[] => widgets.get(BELOW_EDITOR_KEY)?.render(width) ?? [] };
}
function agent(id: string, status = "running", extra = {}) {
  return { id, type: "Explore", description: id, status, startedAt: 1, toolUses: 0, ...(status === "completed" ? { completedAt: Date.now() } : {}), ...extra };
}

describe("surface preference precedence", () => {
  for (const fleetView of [undefined, true, false]) for (const widgetMode of [undefined, "off", "all", "background"] as const) {
    it(`preserves fleet=${fleetView}, widget=${widgetMode} across unrelated save/reload, with one visible surface`, () => {
      const dir = mkdtempSync(join(tmpdir(), "nexus-fleet-"));
      cleanup.push(() => rmSync(dir, { recursive: true, force: true }));
      vi.stubEnv("PI_CODING_AGENT_DIR", join(dir, "global"));
      const prefs = { fleetView, widgetMode };
      expect(saveSettings(prefs, dir)).toBe(true);
      const loaded = loadSettings(dir);
      expect(saveSettings({ ...loaded, showCost: true }, dir)).toBe(true);
      const saved = JSON.parse(readFileSync(join(dir, ".pi/subagents.json"), "utf8"));
      expect(saved).toEqual(JSON.parse(JSON.stringify({ ...prefs, showCost: true })));
      const effective = resolveAgentSurfaces(loadSettings(dir));
      expect(effective).toEqual({ fleet: fleetView !== false, widget: fleetView !== false ? "off" : widgetMode ?? "off" });
      const h = harness(); h.records.push(agent("one"));
      h.fleet.setEnabled(effective.fleet); h.fleet.update();
      const widget = new AgentWidget(h.manager, new Map(), () => effective.widget);
      widget.setUICtx(h.ui); widget.update(); cleanup.push(() => widget.dispose());
      expect(h.render().length > 0).toBe(effective.fleet);
      expect(h.widgets.has("agents")).toBe(effective.widget !== "off");
    });
  }
});

describe("coordinated compact fleet", () => {
  it.each([6, 7])("never owns keys at budget 0/1, including resize before paint (%s rows)", rows => {
    const h = harness(rows); h.metadata(); h.records.push(agent("one")); h.fleet.update();
    expect(h.render().length).toBe(rows - 5);
    for (const key of ["\x1b[102;4u", "\x1b[B", "\x1b[A", "\r", "\x1b"]) expect(h.fleet.handleKey(key)).toBeUndefined();
    h.tui.terminal.rows = 9; h.render();
    expect(h.fleet.handleKey("\x1b[102;4u")).toEqual({ consume: true });
    h.fleet.handleKey("\x1b[B"); expect(h.render().join("\n")).toContain("● Agent");
    h.tui.terminal.rows = rows; // Input before the resize repaint must pass through.
    expect(h.fleet.handleKey("\x1b[B")).toBeUndefined();
    expect(h.fleet.handleKey("\r")).toBeUndefined(); expect(h.fleet.handleKey("\x1b")).toBeUndefined();
    h.tui.terminal.rows = 9; h.render();
    expect(h.fleet.handleKey("\x1b[B")).toBeUndefined();
    expect(h.render().join("\n")).not.toContain("●");
  });
  it.each([true, false])("owns metadata-before-fleet order independent of registration (%s)", first => {
    const h = harness(); h.records.push(agent("running"));
    if (first) h.metadata();
    h.fleet.update();
    if (!first) h.metadata();
    expect(h.widgets.size).toBe(1);
    expect(h.render()[0]).toBe("NEO");
    expect(h.render().join("\n")).toContain("running");
    h.metadata();
    expect(h.render()[0]).toBe("NEO");
    h.fleet.setEnabled(false);
    expect(h.render()).toEqual(["NEO"]);
    h.fleet.setEnabled(true);
    expect(h.render().join("\n")).toContain("running");
  });

  it("recomputes height on resize, multiline input, wrapped text and actual Neo editor renders", () => {
    const h = harness(12); h.metadata();
    for (let i = 0; i < 12; i++) h.records.push(agent(`agent-${i}`));
    h.fleet.update();
    expect(h.render()).toHaveLength(7); // 12 - editor(3) - footer(2)
    h.setText("a\nb\nc\nd");
    expect(h.render()).toHaveLength(4);
    h.tui.terminal.rows = 9;
    expect(h.render()).toEqual(["NEO"]);
    h.setText("");
    expect(h.render()).toHaveLength(4);
    reportEditorRows(h.tui, 100, 5);
    expect(h.render()).toEqual(["NEO", "/agents · 12 agents · 0 workflows"]);
    reportEditorRows(h.tui, 100, 7);
    expect(h.render()).toEqual(["NEO"]);
    h.setText("x".repeat(50));
    for (const width of [1, 5, 12, 25]) {
      const lines = h.render(width);
      expect(lines.every(line => visibleWidth(line) <= width)).toBe(true);
      expect(lines.length).toBeLessThanOrEqual(7);
    }
    expect(h.records).toHaveLength(12);
  });

  it("prioritizes active work, includes sessionless queued records and counts hidden agents/workflows separately", () => {
    const h = harness(10); h.metadata();
    h.records.push(agent("finished", "completed"), agent("queued-1", "queued"), agent("running"), agent("queued-2", "queued"));
    h.fleet.setWorkflowSource(() => [{ id: "w", name: "settled-workflow", status: "completed", startedAt: 1, completedAt: Date.now(), doneCount: 1, totalCount: 1, tokens: 0 }], vi.fn());
    h.fleet.update();
    const lines = h.render();
    expect(lines[1]).toContain("+2 agents · 1 workflows hidden");
    expect(lines[3]).toContain("running");
    expect(lines[4]).toContain("queued-1");
    expect(lines.join("\n")).not.toContain("finished");
    expect(h.records).toHaveLength(4);
    h.fleet.handleKey("\x1b[102;4u"); // Alt+Shift+F explicitly focuses main
    h.fleet.handleKey("\u001b[B"); // running
    h.fleet.handleKey("\u001b[B"); // queued (no session yet)
    h.fleet.handleKey("\r");
    expect(h.ui.notify).toHaveBeenCalledWith("Agent is queued — no session available.", "info");
  });

  it("opens a windowed workflow without deleting hidden records and clears slots independently", async () => {
    const h = harness(8); h.metadata();
    const open = vi.fn();
    h.fleet.setWorkflowSource(() => [{ id: "w", name: "workflow-only", status: "running", startedAt: 1, doneCount: 0, totalCount: 5, tokens: 0 }], open);
    h.fleet.update(); h.render();
    h.fleet.handleKey("\x1b[102;4u"); h.fleet.handleKey("\u001b[B");
    expect(h.render()[2]).toContain("workflow-only");
    h.fleet.handleKey("\r"); await Promise.resolve();
    expect(open).toHaveBeenCalledWith("w");
    setBelowEditorSlot(h.ui, "metadata", undefined);
    expect(h.render().join("\n")).not.toContain("NEO");
    expect(h.render().join("\n")).toContain("workflow-only");
    h.fleet.dispose();
    expect(h.render()).toEqual([]);
  });

  it("keeps every keyboard-selected row visible in two-row fleet budgets and retains menu access in summary mode", () => {
    const h = harness(8); h.metadata();
    for (let i = 0; i < 6; i++) h.records.push(agent(`agent-${i}`));
    h.fleet.update(); h.render();
    h.fleet.handleKey("\x1b[102;4u");
    expect(h.render().join("\n")).toContain("● main");
    for (let i = 0; i < 6; i++) {
      expect(h.fleet.handleKey("\x1b[B")).toEqual({ consume: true });
      expect(h.render()[2]).toContain(`● Agent  agent-${i}`);
    }
    h.tui.terminal.rows = 7;
    expect(h.render()[1]).toContain("/agents");
    h.tui.terminal.rows = 8;
    expect(h.render()[2]).toContain("main");
    expect(h.fleet.handleKey("\x1b[B")).toBeUndefined();
    h.fleet.handleKey("\x1b[102;4u"); h.fleet.handleKey("\x1b[B");
    expect(h.render(20)[2]).toContain("● Agent");
    expect(h.render(20).every(line => visibleWidth(line) <= 20)).toBe(true);
    h.fleet.handleKey("\x1b");
    expect(h.render()[2]).toContain("main");
  });
});
