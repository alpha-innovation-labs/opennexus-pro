import { afterEach, expect, it, vi } from "vitest";
import { CombinedAutocompleteProvider, TuiMainScreen } from "@earendil-works/pi-tui";
import { PromptlineEditor } from "../packages/extension-core/neo-editor/src/features/promptline/PromptlineEditor";
import { clearTriggerSession } from "../packages/extension-core/neo-editor/src/features/promptline/trigger/sessionState";
import { FleetList } from "../packages/extension-core/subagent-tintin/src/ui/fleet-list";
import { createMentionProvider } from "../packages/extension-core/subagent-tintin/src/ui/agent-mention";
import { AgentSelectDialog } from "../packages/extension-core/subagent-tintin/src/ui/shared-dialog";
import { ConversationViewer } from "../packages/extension-core/subagent-tintin/src/ui/conversation-viewer";

// Only external services/decorative status are isolated. PromptlineEditor,
// CustomEditor, Pi Editor, trigger providers, both picker modals and TUI are real.
vi.mock("@nexus/feature-flags/index", () => ({ getRegisteredToolRecords: () => [] }));
vi.mock("@extensions/fff/editor/wrapAutocompleteProviderForCwd", () => ({ wrapAutocompleteProviderForCwd: async (_: unknown, provider: unknown) => provider }));
vi.mock("@extensions/startup-hero/clearStartupHero", () => ({ clearStartupHero() {} }));
vi.mock("@extensions/hotkeys/openHotkeysModal", () => ({ openHotkeysModal: vi.fn() }));
vi.mock("@nexus/runtime/clipboard-image/readClipboardImageViaMacOsJxa", () => ({ readClipboardImageViaMacOsJxa: vi.fn() }));
vi.mock("@nexus/runtime/clipboard-image/writeClipboardImageTempFile", () => ({ writeClipboardImageTempFile: vi.fn() }));
vi.mock("../packages/extension-core/neo-editor/src/features/promptline/render/renderPromptlineEditor", () => ({
  renderPromptlineEditor: (width: number, base: (width: number) => string[]) => base(width),
}));
const identity = (s: string) => s;
const theme: any = { fg: (_: string, s: string) => s, bg: (_: string, s: string) => s, bold: identity, italic: identity, strikethrough: identity, getFgAnsi: () => "", getBgAnsi: () => "" };
const cleanup: (() => void)[] = [];
afterEach(() => { cleanup.splice(0).reverse().forEach(fn => fn()); clearTriggerSession(); });

it("actual Neo editor retains history, arrows, @ and slash pickers, submit/cancel and nested composer input", async () => {
  let send!: (data: string) => void;
  let output = "";
  const terminal: any = { columns: 120, rows: 35, kittyProtocolActive: true,
    start: (input: (data: string) => void) => { send = input; }, stop() {}, drainInput: async () => {},
    write: (data: string) => { output += data; }, moveBy() {}, hideCursor() {}, showCursor() {}, clearLine() {}, clearFromCursor() {}, clearScreen() {}, setTitle() {}, setProgress() {},
  };
  const tui = new TuiMainScreen(terminal);
  cleanup.push(() => tui.stop());
  // Pi exports the manager's type, not its constructor. Load its installed
  // implementation without reading/writing the user's keybindings file.
  const installedManager = new URL("../node_modules/@earendil-works/pi-coding-agent/dist/core/keybindings.js", import.meta.url);
  const { KeybindingsManager } = await import(installedManager.href);
  const keybindings = new KeybindingsManager();
  const ctx: any = { cwd: process.cwd(), ui: { theme, notify() {}, setWidget() {} }, sessionManager: { getBranch: () => [], getEntries: () => [] }, modelRegistry: { getAvailable: () => [], getAll: () => [] } };
  const config: any = { triggerConfig: { rules: [] }, neoConfig: { clearEditorOnTriggerSubmit: true } };
  const editor = new PromptlineEditor(tui, { borderColor: identity, selectList: { selectedPrefix: identity, selectedText: identity, description: identity, scrollInfo: identity, noMatch: identity } }, keybindings, ctx, theme, () => "off", () => {}, () => undefined, () => config, async () => config,
    () => [{ name: "zebra", description: "Test command", source: "extension" } as any]);
  const submitted = vi.fn(); editor.onSubmit = submitted;
  const base = new CombinedAutocompleteProvider([], process.cwd(), null);
  editor.setAutocompleteProvider(createMentionProvider(base, () => [
    { kind: "type", type: "Explore", handle: "explore", description: "Explore code" },
    { kind: "type", type: "Review", handle: "review", description: "Review code" },
  ], () => true));
  tui.addChild(editor); tui.setFocus(editor);
  let widget: any;
  const ui: any = { getEditorText: () => editor.getText(), onTerminalInput: (fn: any) => tui.addInputListener(fn),
    setWidget: (_: string, factory: any) => { if (widget) tui.removeChild(widget); if (factory) { widget = factory(tui, theme); tui.addChild(widget); } }, notify: vi.fn() };
  const record: any = { id: "a", status: "running", type: "Explore", description: "fleet child", startedAt: Date.now(), toolUses: 0 };
  const fleet = new FleetList({ listAgents: () => [record] } as any, new Map());
  fleet.setUICtx(ui); fleet.update(); cleanup.push(() => fleet.dispose());
  tui.start(); tui.renderNow();
  // Real asynchronous picker loading, without timers, processes or model calls.
  const settle = async () => { await new Promise(resolve => setImmediate(resolve)); tui.renderNow(); };
  editor.addToHistory("older prompt"); editor.setText("");
  send("\x1b[A"); expect(editor.getText()).toBe("older prompt");
  send("\x1b[B"); expect(editor.getText()).toBe("");
  send("abc"); send("\x1b[D"); send("X"); expect(editor.getText()).toBe("abXc");
  send("\r"); expect(submitted).toHaveBeenLastCalledWith("abXc");
  editor.setText(""); send("@"); await settle();
  expect(tui.hasOverlay()).toBe(true); expect(output).toContain("explore");
  send("\x1b[102;4u"); send("\x1b[B"); send("\r"); await settle();
  expect(editor.getText()).toContain("@review"); expect(submitted).toHaveBeenCalledTimes(1);
  editor.setText(""); send("@"); await settle(); send("\x1b"); await settle();
  expect(tui.hasOverlay()).toBe(false);
  editor.setText(""); send("/"); await settle();
  expect(tui.hasOverlay()).toBe(true);
  for (const key of "zebra") send(key); await settle(); send("\r"); await settle();
  expect(submitted).toHaveBeenLastCalledWith("/zebra");
  editor.setText(""); send("/"); await settle(); send("\x1b"); await settle();
  expect(tui.hasOverlay()).toBe(false); expect(editor.getText()).toBe("");
  tui.renderNow(); send("\x1b[102;4u"); send("\x1b[B"); tui.renderNow();
  expect(widget.render(120).join("\n")).toContain("● Agent");
  const parent = new AgentSelectDialog(theme, "Parent", ["one"], keybindings, vi.fn());
  const parentHandle = tui.showOverlay(parent, { width: 80 });
  const steer = vi.fn(), stop = vi.fn(); let viewerHandle: any;
  const viewer = new ConversationViewer(tui, { messages: [], subscribe: () => () => {} } as any, record, undefined, theme,
    () => viewerHandle.hide(), stop, keybindings, steer);
  viewerHandle = tui.showOverlay(viewer, { width: 80 }); cleanup.push(() => viewer.dispose());
  send("\r"); send("xgj/@"); send("\r"); expect(steer).toHaveBeenCalledWith("xgj/@"); expect(stop).not.toHaveBeenCalled();
  send("\x1b"); expect(tui.getFocusedComponent()).toBe(parent);
  parentHandle.hide(); expect(tui.getFocusedComponent()).toBe(editor);
  send("\x1b"); send("final"); send("\r"); expect(submitted).toHaveBeenLastCalledWith("final");
});
