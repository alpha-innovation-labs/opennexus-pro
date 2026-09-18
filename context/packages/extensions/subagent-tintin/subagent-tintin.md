# Subagent Tintin

`packages/extension-core/subagent-tintin` contains a locally adapted copy of Tintin's Pi subagent extension. Its entrypoint exports the extension factory, registered with Nexus under `subagent-tintin`. The feature is enabled by default, appears in `/features`, and remains in `--minimal` / `-m`; the Herdr-backed `subagents` extension is not registered.

## Features

- [[upstream-source]] describes source ownership, package boundaries, and attribution.
- [[tron-progress]] defines Nexus transcript progress for `Agent` and `SubagentWorkflow`, including collapsed activity and expanded details.
- [[mention-completion]] combines agent-first `@` suggestions with FFF files and preserves completion spans and identity.
- [[mention-preview]] distinguishes agent actions and metadata from normal file previews.
- [[neo-agent-counts]] places running and queued counts in Neo's existing metadata row.
- [[compact-fleet]] defines the single default below-editor fleet, terminal-space limits, overflow, and preference precedence.
- [[agent-modals]] defines shared modal presentation, preserved controls, and explicit keyboard focus.
- The upstream extension provides agent sessions, background delegation, steering, workflows, scheduling, worktree isolation, and fleet UI. Its package README and `docs/` contain the feature reference.

## Runtime boundary

Nexus adapts presentation and input routing, not upstream execution contracts. Tool names, agent lifecycle, workflow execution, completion notifications, scheduling, and worktree isolation remain intact. Minimal-mode retention does not require Neo or Tron to be enabled; integrations apply when their owning extensions are active.

## File Structure

```text
packages/extension-core/subagent-tintin/
  src/
    index.ts
    agent-runner.ts
    agent-manager.ts
    agent-counts.ts
    workflow/
    ui/
      agent-mention.ts
      reference-completion.d.ts
      below-editor-layout.ts
      shared-dialog.ts
      conversation-viewer.ts
      workflow-dialog.ts
  docs/
  examples/
  LICENSE
  README.md
  UPSTREAM.md
  package.json
  tsconfig.json
```
