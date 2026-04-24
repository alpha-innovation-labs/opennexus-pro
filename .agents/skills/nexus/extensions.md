# extensions

- Source path: `src/extensions`
- Skill index: [`SKILL.md`](./SKILL.md)

## What this area covers

`src/extensions` holds bundled Nexus extensions plus the entrypoints that register them. This top level mixes 4 root files with 21 immediate component folders.

## Root entry files

- `src/extensions/index.ts`
- `src/extensions/registerCompiledBundledExtensions.ts`
- `src/extensions/createBundledExtensionFactories.ts`
- `src/extensions/createCompiledBundledExtensionFactories.ts`

## Component map

- [`annotate`](./extensions/annotate.md) — files: `SOURCE.md`, `constants.ts`, `registerAnnotateExtension.ts`, `types.ts`; subfolders: `command/`, `format/`, `guards/`, `host/`, `runtime/`, `tool/`
- [`cmux`](./extensions/cmux.md) — files: `notifyCmuxPaneCompletion.ts`, `registerCmuxExtension.ts`, `syncCmuxPaneTitle.ts`; subfolders: `runtime/`, `state/`
- [`context-usage`](./extensions/context-usage.md) — files: `formatContextUsage.ts`, `registerContextUsageExtension.ts`
- [`exit-message`](./extensions/exit-message.md) — files: `formatExitMessage.ts`, `registerExitMessageExtension.ts`, `updateExitMessageFromSessionTitle.ts`; subfolders: `state/`
- [`fff`](./extensions/fff.md) — files: `index.ts`, `registerFffExtension.ts`; subfolders: `editor/`, `features/`, `grep/`, `read/`, `runtime/`, `shared/`
- [`generated`](./extensions/generated.md) — files: `registerCompiledEnabledExtensions.ts`
- [`kanban`](./extensions/kanban.md) — files: `registerKanbanExtension.ts`; subfolders: `command/`, `data/`, `modal/`
- [`rtk`](./extensions/rtk.md) — files: `registerRtkExtension.ts`; subfolders: `runtime/`, `tooling/`
- [`neo-editor`](./extensions/neo-editor.md) — files: `config.json`, `editor-triggers.json`, `getNeoConfigPath.ts`, `primeStartupResumeModal.ts`, `readNeoConfig.ts`, `registerNeoEditorExtension.ts`, `types.ts`; subfolders: `editor-triggers/`, `git/`, `promptline/`, `transport/`, `ui/`
- [`notify`](./extensions/notify.md) — files: `registerNotifyExtension.ts`; subfolders: `runtime/`
- [`observations`](./extensions/observations.md) — files: `registerObservationsExtension.ts`; subfolders: `command/`, `shared/`, `status-widget/`, `summarizer/`, `tracker/`
- [`playground`](./extensions/playground.md) — files: `registerPlaygroundExtension.ts`, `registerPlaygroundShortcut.ts`, `types.ts`; subfolders: `model/`, `rpc/`, `runtime/`, `ui/`
- [`shared`](./extensions/shared.md) — subfolders: `observability/`, `slash-menu/`, `two-pane-select-modal/`
- [`startup-logo`](./extensions/startup-logo.md) — files: `buildStartupLogoLines.ts`, `clearStartupLogo.ts`, `hasResumeCliFlag.ts`, `registerStartupLogoExtension.ts`, `shouldShowStartupLogo.ts`, `showStartupLogo.ts`, `startupLogoWidgetKey.ts`
- [`sub-agent-status-widget`](./extensions/sub-agent-status-widget.md) — files: `registerSubagentStatusWidgetExtension.ts`; subfolders: `runtime/`, `ui/`
- [`sub-agents`](./extensions/sub-agents.md) — files: `agent-manager.ts`, `agent-runner.ts`, `agent-types.ts`, `context.ts`, `createBundledAgents.ts`, `cross-extension-rpc.ts`, `custom-agents.ts`, `env.ts`, `group-join.ts`, `index.ts`, `invocation-config.ts`, `memory.ts`, `model-resolver.ts`, `output-file.ts`, `prompts.ts`, `skill-loader.ts`, `types.ts`, `worktree.ts`; subfolders: `agents/`, `context-providers/`, `rpc/`, `rpc-entry/`, `runtime/`, `tooling/`, `ui/`
- [`term-modal`](./extensions/term-modal.md) — files: `registerTermModalExtension.ts`, `types.ts`; subfolders: `ansi/`, `buffer/`, `keybindings/`, `pty/`, `runtime/`, `scripts/`, `ui/`
- [`todo`](./extensions/todo.md) — files: `README.md`, `registerTodoExtension.ts`; subfolders: `model/`, `runtime/`, `storage/`, `ui/`
- [`tron`](./extensions/tron.md) — files: `index.ts`; subfolders: `activity/`, `collapse/`, `colors/`, `compact-tool-lines/`, `duration/`, `shared/`, `thinking/`, `toolcalls/`, `user-message/`
- [`workspace`](./extensions/workspace.md) — files: `README.md`, `WorkspaceSessionsModal.ts`, `formatSessionLabel.ts`, `primeSessionsShortcut.ts`, `registerWorkspaceExtension.ts`, `showSessionsModal.ts`; subfolders: `top-bar/`

## Read this first

1. `src/extensions/index.ts`
2. `src/extensions/createBundledExtensionFactories.ts`
3. `src/extensions/createCompiledBundledExtensionFactories.ts`

## Navigation notes

- Start with the root entry files when you need the boundary or registration flow, then jump into the component that matches the feature you are touching.
- Use the component map above as the one-level drill-down for this folder; deeper structure stays inside each component doc.
- `src/extensions/index.ts` is the central extension entrypoint and registers only the enabled extensions from the feature-flag registry.
- `src/extensions/createBundledExtensionFactories.ts` and `src/extensions/createCompiledBundledExtensionFactories.ts` split source-mode and release-mode extension loading.
