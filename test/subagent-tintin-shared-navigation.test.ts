import { describe, expect, it, vi } from "vitest";
import { KeybindingsManager, TUI_KEYBINDINGS } from "@earendil-works/pi-tui";
import { PlainSelectList } from "../packages/tui-kit/src/modal/select/PlainSelectList";
import { handleTwoPaneRightInput } from "../packages/tui-kit/src/modal/select/handleTwoPaneRightInput";
import { getTwoPaneBodyHeight } from "../packages/tui-kit/src/modal/select/getTwoPaneBodyHeight";
import { AgentSelectDialog, AgentSettingsDialog, DialogNavigation } from "../packages/extension-core/subagent-tintin/src/ui/shared-dialog";
import { ConversationViewer } from "../packages/extension-core/subagent-tintin/src/ui/conversation-viewer";
const theme: any = { fg: (_: string, value: string) => value, bold: (s: string) => s, bg: (_: string, value: string) => value };

describe("Nexus shared navigation parity", () => {
  it.each([
    ["G", "g", "g"], ["\x0e", "\x0e", "\x10"], ["k"], ["G", "j"],
    ["G", "g", "j", "g"], // interrupted gg must not jump
  ])("list sequence %j agrees with PlainSelectList", (...keys: string[]) => {
    const expected = vi.fn(), picked = vi.fn();
    const items = ["a", "b", "c"];
    const shared = new PlainSelectList(theme, 10, item => expected(item.value), () => {});
    shared.setItems(items.map(value => ({ value, label: value })));
    const actual = new AgentSelectDialog(theme, "List", items, undefined, picked);
    for (const key of [...keys, "\r"]) { shared.handleInput(key); actual.handleInput(key); }
    expect(picked.mock.calls).toEqual(expected.mock.calls);
  });

  it("preview scrolling agrees with Nexus gg/G, ctrl+n/p and ctrl+d/u at the same viewport", () => {
    const navigation = new DialogNavigation();
    const rows = getTwoPaneBodyHeight();
    let offset = 0, pending = false, actual = 0;
    for (const data of ["G", "g", "g", "\x04", "\x0e", "\x10", "\x15", "g", "j", "g", "g"]) {
      const result = handleTwoPaneRightInput({ data, rightLinesLength: 100, rightScrollOffset: offset, pendingRightGotoStart: pending });
      offset = result.rightScrollOffset; pending = result.pendingRightGotoStart;
      actual = navigation.move(data, actual, 100 - rows, rows) ?? actual;
      expect(actual, JSON.stringify(data)).toBe(offset);
    }
  });

  it("Escape returns from preview without closing; Ctrl+C closes from either pane", () => {
    const closed = vi.fn(), selected = vi.fn();
    const kb = new KeybindingsManager(TUI_KEYBINDINGS);
    const modal = new AgentSelectDialog(theme, "List\ndetails", ["a", "b"], kb, selected);
    modal.handleInput("\x0e"); modal.handleInput("\t"); modal.handleInput("\x1b");
    expect(selected).not.toHaveBeenCalled(); modal.handleInput("\r"); expect(selected).toHaveBeenLastCalledWith("b");
    modal.handleInput("\t"); modal.handleInput("\x03"); expect(selected).toHaveBeenLastCalledWith(undefined);
    const tui: any = { terminal: { rows: 30 }, requestRender() {} };
    const settings = new AgentSettingsDialog(tui, theme, "Settings", [
      { id: "a", label: "A", currentValue: "off", values: ["off", "on"] },
      { id: "b", label: "B", currentValue: "off", values: ["off", "on"] },
    ], kb, selected, closed);
    for (const key of ["G", "g", "g", "\r"]) settings.handleInput(key);
    expect(selected).toHaveBeenLastCalledWith("a", "on");
    settings.handleInput("\t"); settings.handleInput("\x1b"); expect(closed).not.toHaveBeenCalled();
    settings.handleInput("\t"); settings.handleInput("\x03"); expect(closed).toHaveBeenCalledTimes(1);
  });

  it("configured navigation and key releases do not corrupt gg state", () => {
    const picked = vi.fn();
    const modal = new AgentSelectDialog(theme, "List", ["a", "b", "c"], { matches: (data, id) => data === "D" && id === "tui.select.down" }, picked);
    for (const key of ["G", "g", "\x1b[103;1:3u", "g", "D", "\r"]) modal.handleInput(key);
    expect(picked).toHaveBeenCalledWith("b");
  });

  it("conversation shared aliases scroll live and historical content",  () => {
    const tui: any = { terminal: { rows: 30 }, requestRender() {} };
    const messages = Array.from({ length: 40 }, (_, i) => ({ role: "user", content: `message-${i}` }));
    const viewer = new ConversationViewer(tui, { messages, subscribe: () => () => {} } as any,
      { status: "completed", type: "Explore", description: "history", startedAt: 1, toolUses: 0 } as any, undefined, theme, vi.fn());
    try {
      expect(viewer.render(100).join("\n")).toContain("message-39");
      viewer.handleInput("g"); viewer.handleInput("g"); expect(viewer.render(100).join("\n")).toContain("message-0");
      viewer.handleInput("\x04"); expect(viewer.render(100).join("\n")).not.toContain("message-0");
      viewer.handleInput("\x15"); expect(viewer.render(100).join("\n")).toContain("message-0");
      viewer.handleInput("G"); expect(viewer.render(100).join("\n")).toContain("message-39");
    } finally { viewer.dispose(); }
  });
});
