import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { updateActiveWorkflowStep } from "../state/workflowRunStore.js";

/**
 * Registers lightweight workflow progress tracking from Agent tool calls.
 *
 * @param pi Pi extension API.
 */
export function registerWorkflowAgentEvents(pi: ExtensionAPI): void {
  pi.on("tool_call", (event) => {
    if (event.toolName !== "Agent") return;
    const input = event.input as { subagent_type?: string; mode?: string };
    if (input.subagent_type === "Librarian") {
      updateActiveWorkflowStep("librarian", "Librarian", "running");
      return;
    }
    if (input.subagent_type === "Engineer") {
      const step = getEngineerStep(input.mode);
      updateActiveWorkflowStep(step.id, step.label, "running");
    }
  });

  pi.on("tool_result", (event) => {
    if (event.toolName !== "Agent") return;
    const input = event.input as { subagent_type?: string; mode?: string };
    const text = event.content.map((part) => part.type === "text" ? part.text : "").join("\n");
    const agentId = text.match(/Started background subagent ([^\s]+)/)?.[1];
    const status = event.isError ? "error" : "done";
    if (input.subagent_type === "Librarian") {
      updateActiveWorkflowStep("librarian", "Librarian", status, agentId);
      return;
    }
    if (input.subagent_type === "Engineer") {
      const step = getEngineerStep(input.mode);
      updateActiveWorkflowStep(step.id, step.label, status, agentId);
    }
  });
}

/**
 * Maps Engineer mode to workflow modal step.
 *
 * @param mode Engineer mode.
 * @returns Step id and label.
 */
function getEngineerStep(mode: string | undefined): { id: string; label: string } {
  switch (mode) {
    case "setup":
      return { id: "setup", label: "Setup" };
    case "e2e":
      return { id: "e2e", label: "E2E" };
    case "qa":
      return { id: "qa", label: "QA" };
    case "merge":
      return { id: "merge", label: "Merge" };
    default:
      return { id: "implementation", label: "Coder" };
  }
}
