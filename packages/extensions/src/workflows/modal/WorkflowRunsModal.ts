import type { ExtensionCommandContext } from "@mariozechner/pi-coding-agent";
import type { AutocompleteItem } from "@mariozechner/pi-tui";
import { SelectPreviewModal } from "@nexus/tui-kit/modal/index.js";
import { sharedSubagentRuntime } from "../../sub-agents/runtime/sharedSubagentRuntime.js";
import type { SubagentTranscriptEntry } from "../../sub-agents/types.js";
import { getWorkflowStepDisplay } from "../state/getWorkflowStepDisplay.js";
import type { WorkflowRun, WorkflowStep } from "../state/types.js";

/**
 * Modal for inspecting workflow runs, nested steps, and selected step transcripts.
 */
export class WorkflowRunsModal extends SelectPreviewModal {
  constructor(theme: ExtensionCommandContext["ui"]["theme"], runs: WorkflowRun[], done: (result: undefined) => void) {
    const runById = new Map(runs.map((run) => [run.id, run]));
    const stepByValue = new Map<string, { run: WorkflowRun; step: WorkflowStep }>();
    const items = buildWorkflowItems(runs, stepByValue);

    super(theme, () => done(undefined), () => done(undefined), undefined, {
      leftTitle: "Workflow runs",
      rightTitle: "Conversation",
      leftPaneRatio: 0.45,
      itemMaxLines: () => 2,
    });
    this.setOnSelectionChange((item) => {
      if (!item) {
        this.setRightLines(["No workflow run selected"]);
        return;
      }
      const stepRecord = stepByValue.get(item.value);
      if (stepRecord) {
        this.setRightLines(buildStepConversationLines(stepRecord.run, stepRecord.step));
        return;
      }
      const run = runById.get(item.value);
      this.setRightLines(run ? buildRunSummaryLines(run) : ["No workflow run selected"]);
    });
    this.setItems(items);
  }
}

/**
 * Builds left-pane items with steps nested under each workflow run.
 *
 * @param runs Workflow runs.
 * @param stepByValue Output lookup for step items.
 * @returns Selectable modal items.
 */
function buildWorkflowItems(runs: WorkflowRun[], stepByValue: Map<string, { run: WorkflowRun; step: WorkflowStep }>): AutocompleteItem[] {
  const items: AutocompleteItem[] = [];
  for (const run of runs) {
    items.push({
      value: run.id,
      label: run.workflowName,
      description: `${run.status} • ${new Date(run.updatedAt).toLocaleTimeString()}`,
    });
    for (const step of run.steps) {
      const value = `${run.id}:${step.id}`;
      stepByValue.set(value, { run, step });
      items.push({
        value,
        label: getWorkflowStepDisplay(step),
        description: step.agentId ? `agent ${step.agentId}` : step.status,
      });
    }
  }
  return items;
}

/**
 * Builds right-pane summary lines for one workflow run.
 *
 * @param run Workflow run.
 * @returns Modal detail lines.
 */
function buildRunSummaryLines(run: WorkflowRun): string[] {
  return [
    run.workflowName,
    "",
    ...run.steps.map(getWorkflowStepDisplay),
    "",
    `Status: ${run.status}`,
    `Updated: ${new Date(run.updatedAt).toLocaleString()}`,
    run.request ? `Request: ${run.request}` : "Request: not captured",
  ];
}

/**
 * Builds right-pane transcript lines for the selected workflow step.
 *
 * @param run Workflow run that owns the step.
 * @param step Selected workflow step.
 * @returns Conversation transcript lines.
 */
function buildStepConversationLines(run: WorkflowRun, step: WorkflowStep): string[] {
  const header = [`${run.workflowName} / ${step.label}`, `Status: ${step.status}`, step.agentId ? `Agent: ${step.agentId}` : "Agent: not started", ""];
  if (!step.agentId) return [...header, "No subagent conversation is available for this step yet."];

  const subagentRun = sharedSubagentRuntime.getRun(step.agentId);
  if (!subagentRun) return [...header, "No live subagent run found for this step."];
  const transcript = subagentRun.transcript.length > 0 ? subagentRun.transcript : [{ role: "assistant", text: subagentRun.resultText || subagentRun.liveAssistantText || "No transcript content yet.", createdAt: Date.now() } satisfies SubagentTranscriptEntry];
  return [...header, ...transcript.flatMap(formatTranscriptEntry)];
}

/**
 * Formats one subagent transcript entry for modal display.
 *
 * @param entry Transcript entry.
 * @returns Display lines.
 */
function formatTranscriptEntry(entry: SubagentTranscriptEntry): string[] {
  const label = entry.role === "user" ? "User" : entry.role === "assistant" ? "Assistant" : entry.role === "tool" ? `Tool${entry.toolName ? `:${entry.toolName}` : ""}` : entry.role;
  const text = entry.text.trim() || "(empty)";
  return [`[${label}]`, ...text.split("\n"), ""];
}
