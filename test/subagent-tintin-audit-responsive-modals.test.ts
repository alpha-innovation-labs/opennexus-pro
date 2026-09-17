import { expect, it } from "vitest";
import { ConversationViewer } from "../packages/extension-core/subagent-tintin/src/ui/conversation-viewer";
import { WorkflowDialog } from "../packages/extension-core/subagent-tintin/src/ui/workflow-dialog";

const theme: any = { fg: (_: string, value: string) => value, bold: (value: string) => value };

it("retains conversation chrome and identity on a short terminal while composing", () => {
  const viewer = new ConversationViewer(
    { terminal: { rows: 10 }, requestRender() {} } as any,
    { messages: [{ role: "user", content: "history" }], subscribe: () => () => {} } as any,
    { id: "audit", status: "running", type: "Explore", description: "AUDIT IDENTITY", startedAt: Date.now(), toolUses: 0, invocation: { modelId: "provider/model" } } as any,
    undefined, theme, () => {}, () => {}, undefined, () => {},
  );
  try {
    viewer.handleInput("\r");
    viewer.handleInput("composer text");
    const lines = viewer.render(72);
    expect(lines.length).toBeLessThanOrEqual(7);
    expect(lines.join("\n")).toContain("composer text");
    expect(lines[0]).toMatch(/^┌/);
    expect(lines.join("\n")).toContain("AUDIT IDENTITY");
  } finally { viewer.dispose(); }
});

it("retains workflow identity and discoverable detail-pane access on a short terminal", () => {
  const dialog = new WorkflowDialog(
    { terminal: { rows: 14 }, requestRender() {} } as any,
    () => ({ task: { status: "running", workflowName: "AUDIT WORKFLOW", startTime: Date.now() }, agentCount: 1,
      progress: [{ type: "workflow_agent", index: 0, state: "progress", label: "child", recordId: "a", promptPreview: "prompt details" }] }) as any,
    theme, () => {}, { onKill() {}, onPause() {}, onRetryAgent() {}, onSkipAgent() {} },
  );
  try {
    dialog.handleInput("\r");
    const lines = dialog.render(72);
    expect(lines.length).toBeLessThanOrEqual(9);
    expect(lines.join("\n")).toContain("AUDIT WORKFLOW");
    expect(lines.join("\n")).toContain("Tab");
  } finally { dialog.dispose(); }
});
