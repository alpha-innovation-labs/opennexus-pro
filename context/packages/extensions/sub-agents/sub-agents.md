---
language: ts
---

Provides RPC-backed child-agent spawning, result lookup, steering, transcript history, a bundled Librarian prompt provider, and `.nexus`-backed custom agent/skill/memory discovery for Nexus.

## Features
- [[features/tooling/agent-tool|agent-tool]]: Spawns child runs, seeds prompt context, and returns either a background id or the foreground result.
- [[features/tooling/get-subagent-result-tool|get-subagent-result-tool]]: Reads current or persisted run state and can wait for queued work to finish.
- [[features/tooling/steer-subagent-tool|steer-subagent-tool]]: Queues or forwards steering messages and records them in the child transcript as user entries.
- [[features/ui/register-subagent-commands|register-subagent-commands]]: Registers the `/agents` history surface for browsing past runs and transcripts from the current parent scope only.

## File Structure
```text
src/
  extensions/
    sub-agents/
      index.ts
      createBundledAgents.ts
      agents/
        librarian.ts
      tooling/
        createAgentTool.ts
        createGetSubagentResultTool.ts
        createSteerSubagentTool.ts
      runtime/
        startSubagentRun.ts
        executeSubagentRun.ts
        formatSubagentResult.ts
        listAvailableSubagentRuns.ts
        persistSubagentRun.ts
        sharedSubagentRuntime.ts
        waitForSubagentCompletion.ts
      context-providers/
        createObservationsContextProvider.ts
        createParentConversationProvider.ts
        createProjectContextProvider.ts
        createSubagentContextRegistry.ts
      rpc/
        createSubagentRpcClient.ts
      rpc-entry/
        nexus-rpc-entry.js
      ui/
        registerSubagentCommands.ts
        showSubagentHistoryModal.ts
        SubagentHistoryModal.ts
```
