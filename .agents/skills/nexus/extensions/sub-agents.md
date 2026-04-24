# extensions/sub-agents

- Source path: `src/extensions/sub-agents`
- Parent: [`extensions`](../extensions.md)

## What this area covers

`src/extensions/sub-agents` contains the bundled `sub-agents` extension. In `feature-flags.json` it is currently marked `enabled`. At the root it has 18 files plus 7 nested folders.

## Feature-flag summary

- Enabled in `feature-flags.json`: `true`
- Declared features:
  - rpc child-process subagent execution
  - custom context providers
  - background result lookup and steering

## Key files

- `src/extensions/sub-agents/index.ts`
- `src/extensions/sub-agents/agent-manager.ts`
- `src/extensions/sub-agents/agent-runner.ts`
- `src/extensions/sub-agents/agent-types.ts`
- `src/extensions/sub-agents/context.ts`
- `src/extensions/sub-agents/cross-extension-rpc.ts`
- `src/extensions/sub-agents/createBundledAgents.ts`
- `src/extensions/sub-agents/custom-agents.ts`
- `src/extensions/sub-agents/env.ts`
- `src/extensions/sub-agents/group-join.ts`
- `src/extensions/sub-agents/invocation-config.ts`
- `src/extensions/sub-agents/memory.ts`
- `src/extensions/sub-agents/model-resolver.ts`
- `src/extensions/sub-agents/output-file.ts`
- `src/extensions/sub-agents/prompts.ts`
- `src/extensions/sub-agents/skill-loader.ts`
- `src/extensions/sub-agents/worktree.ts`
- `src/extensions/sub-agents/types.ts`

## Immediate subareas

- `src/extensions/sub-agents/agents/`
- `src/extensions/sub-agents/context-providers/`
- `src/extensions/sub-agents/rpc/`
- `src/extensions/sub-agents/rpc-entry/`
- `src/extensions/sub-agents/runtime/`
- `src/extensions/sub-agents/tooling/`
- `src/extensions/sub-agents/ui/`

## Read this first

1. `src/extensions/sub-agents/index.ts`
2. `src/extensions/sub-agents/agent-runner.ts`
3. `src/extensions/sub-agents/runtime/`

## Navigation notes

- Start with the first listed file to find the public entrypoint, registration boundary, or top-level contract for this area.
- Then use the root files for shared types, config, or provenance notes and descend into the subfolder whose name matches the behavior you need.
