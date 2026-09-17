import { expect, it, vi } from "vitest";
import { stripTerminalSequences, visibleWidth } from "@earendil-works/pi-tui";
import { ConversationViewer } from "../packages/extension-core/subagent-tintin/src/ui/conversation-viewer";
import { WorkflowDialog } from "../packages/extension-core/subagent-tintin/src/ui/workflow-dialog";

const theme: any = { fg: (_: string, value: string) => value, bold: (value: string) => value };
const bindings: Record<string, string> = {
  "tui.select.up": "U", "tui.select.down": "D", "tui.select.confirm": "O",
  "tui.select.cancel": "Q", "tui.input.submit": "S", "tui.select.pageUp": "P", "tui.select.pageDown": "N",
};
const kb = { matches: (data: string, id: string) => bindings[id] === data, getKeys: (id: string) => [bindings[id]] };
function framed(lines: string[], rows: number, width: number) {
  expect(lines.length).toBeLessThanOrEqual(Math.floor(rows * .7));
  expect(lines[0]).toMatch(/^┌/);
  expect(lines.at(-1)).toMatch(/^└/);
  for (const line of lines) expect(visibleWidth(line)).toBeLessThanOrEqual(width);
  return lines.map(stripTerminalSequences).join("\n");
}

for (const width of [48, 72]) for (const metadata of [false, true]) {
  it(`conversation preserves identity, input and live history through resize (${width}, metadata=${metadata})`, () => {
    const tui: any = { terminal: { rows: 24 }, requestRender: vi.fn() };
    let changed!: () => void;
    const unsubscribe = vi.fn();
    const session: any = { messages: [{ role: "user", content: "history tail" }], subscribe: (fn: () => void) => { changed = fn; return unsubscribe; } };
    const record: any = { id: "a", type: "Explore", description: "IDENTITY", status: "running", startedAt: Date.now(), toolUses: 0,
      ...(metadata ? { invocation: { modelId: "provider/model" } } : {}) };
    const steer = vi.fn(), stop = vi.fn(), done = vi.fn();
    const viewer = new ConversationViewer(tui, session, record, undefined, theme, done, stop, kb, steer);
    try {
      for (const rows of [24, 14, 10, 24]) {
        tui.terminal.rows = rows;
        let text = framed(viewer.render(width), rows, width);
        for (const hint of ["IDENTITY", "history tail", "O steer", "x stop", "Q close"]) expect(text).toContain(hint);
        if (metadata && rows === 24) expect(text).toContain("provider/model");
        viewer.handleInput("O"); viewer.handleInput("draft x m");
        text = framed(viewer.render(width), rows, width);
        for (const hint of ["IDENTITY", "draft x m", "S send", "Q cancel"]) expect(text).toContain(hint);
        expect(stop).not.toHaveBeenCalled();
        viewer.handleInput("S"); expect(steer).toHaveBeenLastCalledWith("draft x m");
        viewer.handleInput("O"); viewer.handleInput("discard"); viewer.handleInput("Q");
        expect(done).not.toHaveBeenCalled();
      }
      viewer.handleInput("O"); viewer.handleInput("resize draft");
      for (const rows of [10, 14, 24]) {
        tui.terminal.rows = rows;
        const text = framed(viewer.render(width), rows, width);
        expect(text).toContain("IDENTITY"); expect(text).toContain("resize draft"); expect(text).toContain("Q cancel");
      }
      viewer.handleInput("Q");
      session.messages.push({ role: "user", content: "live tail" }); changed();
      expect(tui.requestRender).toHaveBeenCalled();
      expect(framed(viewer.render(width), 24, width)).toContain("live tail");
      record.status = "completed"; changed();
      for (const rows of [10, 14, 24]) {
        tui.terminal.rows = rows;
        const text = framed(viewer.render(width), rows, width);
        expect(text).toContain("IDENTITY"); expect(text).toContain("Q close");
        expect(text).not.toContain("x stop"); expect(text).not.toContain("O steer");
      }
      viewer.handleInput("Q"); expect(done).toHaveBeenCalledOnce();
    } finally { viewer.dispose(); }
    expect(unsubscribe).toHaveBeenCalledOnce();
  });
}

for (const width of [48, 72]) for (const rows of [10, 14, 24]) {
  it(`workflow keeps selected rows, actions and scrollable details at ${width}x${rows}`, () => {
    const tui: any = { terminal: { rows }, requestRender: vi.fn() };
    const source: any = { task: { status: "running", workflowName: "WORKFLOW ID", startTime: Date.now() }, agentCount: 5,
      progress: Array.from({ length: 5 }, (_, index) => ({ type: "workflow_agent", index, state: "progress", label: `child${index}`, recordId: `a${index}`,
        promptPreview: Array.from({ length: 20 }, (_, n) => `prompt ${n}`).join("\n"), resultPreview: "final outcome" })) };
    const actions = { onKill: vi.fn(), onPause: vi.fn(), onResume: vi.fn(), onRetryAgent: vi.fn(), onSkipAgent: vi.fn(), onOpenAgent: vi.fn() };
    const done = vi.fn();
    const dialog = new WorkflowDialog(tui, () => source, theme, done, actions, 0, kb);
    const render = () => framed(dialog.render(width), tui.terminal.rows, width);
    try {
      let text = render();
      for (const hint of ["WORKFLOW ID", "Tab", "O open", "f filter", "Q close", "p pause", "x stop", "c convo"]) expect(text).toContain(hint);
      dialog.handleInput("O"); render(); dialog.handleInput("G");
      text = render(); expect(text).toContain("child4");
      for (const hint of ["WORKFLOW ID", "Tab", "s skip", "r retry", "Q back", "c convo"]) expect(text).toContain(hint);
      dialog.handleInput("c"); expect(actions.onOpenAgent).toHaveBeenCalledWith("a4");
      source.progress.push({ ...source.progress[4], state: "done" });
      dialog.handleInput("\t"); dialog.handleInput("O"); render();
      for (const resize of [10, 24, 14, rows]) {
        tui.terminal.rows = resize; render(); dialog.handleInput("G");
        text = render();
        for (const hint of ["WORKFLOW ID", "Tab list", "Q back", "O expand", "U/D/P/N/Home/End", "final outcome"]) expect(text).toContain(hint);
        dialog.handleInput("x"); dialog.handleInput("s"); dialog.handleInput("r");
      }
      expect(actions.onKill).not.toHaveBeenCalled(); expect(actions.onSkipAgent).not.toHaveBeenCalled(); expect(actions.onRetryAgent).not.toHaveBeenCalled();
      dialog.handleInput("Q"); source.task.status = "paused";
      expect(render()).toContain("p resume"); dialog.handleInput("p"); expect(actions.onResume).toHaveBeenCalledOnce();
      source.task.status = "completed";
      text = render(); expect(text).not.toContain("x stop"); expect(text).not.toContain("r retry"); expect(text).toContain("c convo");
      dialog.handleInput("Q"); expect(render()).toContain("Q close"); dialog.handleInput("Q"); expect(done).toHaveBeenCalledOnce();
    } finally { dialog.dispose(); }
  });
}

for (const width of [48, 72]) it(`default hints remain actionable after short resize at width ${width}`, () => {
  const tui: any = { terminal: { rows: 24 }, requestRender() {} };
  const record: any = { id: "a", type: "Explore", description: "IDENTITY", status: "running", startedAt: Date.now(), toolUses: 0 };
  const stop = vi.fn(), steer = vi.fn();
  const viewer = new ConversationViewer(tui, { messages: [], subscribe: () => () => {} } as any, record, undefined, theme, () => {}, stop, undefined, steer);
  const source: any = { task: { status: "running", workflowName: "WORKFLOW ID", startTime: Date.now() }, agentCount: 1,
    progress: [{ type: "workflow_agent", index: 0, state: "progress", label: "child", recordId: "a", promptPreview: "a\nb\nc\nd\ne\nf" }] };
  const dialog = new WorkflowDialog(tui, () => source, theme, () => {}, { onKill() {}, onPause() {}, onRetryAgent() {}, onSkipAgent() {}, onOpenAgent() {} });
  try {
    dialog.handleInput("\r");
    for (const rows of [10, 14, 24]) {
      tui.terminal.rows = rows;
      const text = framed(dialog.render(width), rows, width);
      for (const hint of ["WORKFLOW ID", "Tab", "s skip", "r retry", "p pause", "x stop", "esc back", "c convo"]) expect(text).toContain(hint);
      const conversation = framed(viewer.render(width), rows, width);
      for (const hint of ["IDENTITY", "Enter steer", "x stop", "Esc close"]) expect(conversation).toContain(hint);
    }
    tui.terminal.rows = 10; viewer.handleInput("\r"); viewer.handleInput("draft");
    const text = framed(viewer.render(width), 10, width);
    for (const hint of ["draft", "Enter send", "Esc cancel"]) expect(text).toContain(hint);
    viewer.handleInput("\r"); expect(steer).toHaveBeenCalledWith("draft");
    viewer.handleInput("x");
    const armed = framed(viewer.render(width), 10, width);
    expect(armed).toContain("x again to STOP"); expect(armed).toContain("Esc close");
    viewer.handleInput("x"); expect(stop).toHaveBeenCalledOnce();
  } finally { viewer.dispose(); dialog.dispose(); }
});
