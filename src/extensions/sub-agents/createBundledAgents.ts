import { getLibrarianPromptText } from "./agents/librarian.js";
import type { AgentConfig } from "./types.js";

const LIBRARIAN_AGENT_NAME = "Librarian";
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
  ]);
}
