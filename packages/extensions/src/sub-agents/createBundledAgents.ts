import { getWorkflowEngineerPrompt } from "@nexus/mini-apps/workflows/prompts/getWorkflowEngineerPrompt.js";
import { getLibrarianPromptText } from "./agents/librarian.js";
import type { AgentConfig } from "./types.js";

const LIBRARIAN_AGENT_NAME = "Librarian";
const ENGINEER_AGENT_NAME = "Engineer";
const READ_ONLY_TOOL_NAMES = ["read", "bash", "grep", "find", "ls"];

/**
 * Creates the bundled subagent registry.
 *
 * @returns Bundled agent configs keyed by name.
 */
export function createBundledAgents(): Map<string, AgentConfig> {
  return new Map([
    [
      LIBRARIAN_AGENT_NAME,
      {
        name: LIBRARIAN_AGENT_NAME,
        displayName: LIBRARIAN_AGENT_NAME,
        description: "Read-only codebase librarian for source-backed lookup and summaries",
        builtinToolNames: READ_ONLY_TOOL_NAMES,
        extensions: true,
        skills: true,
        systemPrompt: getLibrarianPromptText(),
        promptMode: "replace",
        inheritContext: false,
        runInBackground: false,
        isolated: false,
        isDefault: true,
        source: "builtin",
      },
    ],
    [
      ENGINEER_AGENT_NAME,
      {
        name: ENGINEER_AGENT_NAME,
        displayName: ENGINEER_AGENT_NAME,
        description: "Workflow implementation, e2e, QA, and merge-resolution engineer",
        builtinToolNames: ["read", "bash", "edit", "write", "grep", "find", "ls"],
        extensions: true,
        skills: true,
        systemPrompt: getWorkflowEngineerPrompt(),
        promptMode: "replace",
        inheritContext: false,
        runInBackground: true,
        isolated: false,
        isDefault: true,
        source: "builtin",
      },
    ],
  ]);
}
