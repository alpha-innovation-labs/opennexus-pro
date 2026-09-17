import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { stripTerminalSequences } from "@earendil-works/pi-tui";
import { afterEach, describe, expect, it, vi } from "vitest";
import tintin from "../packages/extension-core/subagent-tintin/src/index";
import { AgentManager } from "../packages/extension-core/subagent-tintin/src/agent-manager";
import { saveSettings } from "../packages/extension-core/subagent-tintin/src/settings";
import { BELOW_EDITOR_KEY } from "../packages/extension-core/subagent-tintin/src/ui/below-editor-layout";

// Agent definitions are irrelevant here; do not read the user's global roster.
vi.mock("../packages/extension-core/subagent-tintin/src/custom-agents", () => ({ loadCustomAgents: () => [] }));
const theme = { fg: (_: string, s: string) => s, bg: (_: string, s: string) => s, bold: (s: string) => s };
const cleanup: Array<() => unknown> = [];
afterEach(async () => {
  for (const fn of cleanup.splice(0)) await fn();
  vi.restoreAllMocks(); vi.unstubAllEnvs(); vi.useRealTimers();
});

describe("registered /agents settings live surface labels", () => {
  it.each(["all", "background", undefined] as const)("refreshes in place and preserves widget=%s", async widgetMode => {
    vi.useFakeTimers();
    const dir = mkdtempSync(join(tmpdir(), "nx-settings-refresh-"));
    vi.stubEnv("PI_CODING_AGENT_DIR", join(dir, "global"));
    vi.spyOn(process, "cwd").mockReturnValue(dir);
    saveSettings({ widgetMode, showCost: false, maxConcurrent: 7, schedulingEnabled: false }, dir);
    const handlers = new Map<string, Array<(...args: any[]) => any>>();
    const commands = new Map<string, any>();
    const noop = vi.fn();
    tintin({ registerTool: noop, registerCommand: (name: string, command: any) => commands.set(name, command),
      registerShortcut: noop, registerFlag: noop, registerMessageRenderer: noop, registerEntryRenderer: noop,
      events: { on: () => noop, emit: noop },
      on: (name: string, callback: any) => handlers.set(name, [...handlers.get(name) ?? [], callback]),
    } as unknown as ExtensionAPI);
    cleanup.push(async () => {
      for (const fn of handlers.get("session_shutdown") ?? []) await fn();
      vi.clearAllTimers(); rmSync(dir, { recursive: true, force: true });
    });
    // A local record exercises real widget/fleet rendering; no runner is launched.
    vi.spyOn(AgentManager.prototype, "listAgents").mockReturnValue([{
      id: "fixture", type: "Explore", description: "fixture", status: "running", startedAt: 1,
      toolUses: 0, isBackground: true,
    } as any]);
    const tui = { terminal: { rows: 60, columns: 180 }, requestRender: vi.fn() };
    const widgets = new Map<string, any>();
    const visible = (key: string) => (widgets.get(key)?.render(180) ?? []).length > 0;
    const assertSurface = (fleet: boolean) => {
      expect(visible(BELOW_EDITOR_KEY)).toBe(fleet);
      expect(visible("agents")).toBe(!fleet && widgetMode !== undefined);
      expect(Number(visible(BELOW_EDITOR_KEY)) + Number(visible("agents"))).toBeLessThanOrEqual(1);
    };
    const kb = { matches: (data: string, id: string) => ({ "tui.select.down": "n", "tui.select.up": "p",
      "tui.select.confirm": "x", "tui.select.cancel": "q" } as Record<string, string>)[id] === data,
      getKeys: (id: string) => [id === "tui.select.down" ? "n" : id === "tui.select.up" ? "p" : id === "tui.select.confirm" ? "x" : "q"] };
    let mounts = 0;
    const saved = () => JSON.parse(readFileSync(join(dir, ".pi/subagents.json"), "utf8"));
    const ui: any = { theme, notify: noop, setStatus: noop, getEditorText: () => "", onTerminalInput: () => noop,
      setWidget: (key: string, factory: any) => {
        if (factory) widgets.set(key, factory(tui, theme)); else widgets.delete(key);
        // Check intermediate registration states too: never two active surfaces.
        expect(Number(visible(BELOW_EDITOR_KEY)) + Number(visible("agents"))).toBeLessThanOrEqual(1);
      },
      custom: async (factory: any) => {
        let result: unknown;
        const dialog = factory(tui, theme, kb, (value: unknown) => { result = value; });
        mounts++;
        const screen = () => dialog.render(180).map(stripTerminalSequences).join("\n");
        const moveTo = (label: string) => {
          for (let i = 0; i < 40 && !screen().includes(`❯ ${label}:`); i++) dialog.handleInput("n");
          expect(screen()).toContain(`❯ ${label}:`);
        };
        if (mounts === 1) {
          dialog.handleInput("G"); dialog.handleInput("x"); // real Agents selector -> Settings
        } else if (mounts === 2) {
          if (widgetMode !== undefined) {
            // Explicitly choose the legacy mode through the registered menu too.
            // All three choices remain dormant while fleet is on.
            moveTo("Widget (dormant: fleet enabled)");
            for (let i = 0; i < 3; i++) {
              dialog.handleInput("x");
              expect(visible("agents")).toBe(false);
            }
            expect(saved().widgetMode).toBe(widgetMode);
            expect(screen()).toContain(`❯ Widget (dormant: fleet enabled): ${widgetMode}`);
          }
          moveTo("Show cost"); dialog.handleInput("x");
          expect(saved()).toMatchObject({ showCost: true, maxConcurrent: 7 });
          expect(saved()).not.toHaveProperty("fleetView");
          expect(saved().widgetMode).toBe(widgetMode);
          moveTo("Fleet view");
          for (const enabled of [false, true, false, true]) {
            dialog.handleInput("x");
            expect(screen()).toContain(`❯ Fleet view: ${enabled ? "on" : "off"}`);
            expect(screen()).toContain("● Subagent Settings · ○ Description");
            assertSurface(enabled);
            expect(saved().widgetMode).toBe(widgetMode);
            if (widgetMode === undefined) expect(saved()).not.toHaveProperty("widgetMode");
            const label = enabled ? "Widget (dormant: fleet enabled)" : "Widget";
            moveTo(label);
            expect(screen()).toContain(`❯ ${label}: ${widgetMode ?? "off"}`);
            if (!enabled) expect(screen()).not.toContain("Widget (dormant");
            dialog.handleInput("\t");
            expect(screen()).toContain("○ Subagent Settings · ● Description");
            dialog.handleInput("q"); // preview-back retains the Widget selection
            expect(screen()).toContain(`❯ ${label}:`);
            for (let i = 0; i < 3; i++) dialog.handleInput("p");
            expect(screen()).toContain("❯ Fleet view:");
          }
          expect(mounts).toBe(2); // never reopen while toggling
          expect(saved()).toMatchObject({ showCost: true, maxConcurrent: 7 });
          dialog.handleInput("q");
        } else dialog.handleInput("q"); // return to and dismiss Agents menu
        return result;
      },
    };
    const ctx: any = { cwd: dir, ui, hasUI: true, modelRegistry: { getAvailable: () => [] } };
    for (const fn of handlers.get("tool_execution_start") ?? []) await fn({}, ctx);
    await commands.get("agents").handler("", ctx);
    expect(mounts).toBe(3);
    expect(tui.requestRender).toHaveBeenCalled();
  });
});
