# extensions

- Source path: `src/extensions`
- Skill index: [`SKILL.md`](./SKILL.md)

## What this area covers

`src/extensions` holds bundled Nexus extensions plus runtime entrypoints that register them.

## Runtime entry files

- `src/extensions/runtime/registerBundledExtensions.ts`
- `src/extensions/runtime/createBundledExtensionFactories.ts`

## Component map

- [`annotate`](./extensions/annotate.md) — files: `SOURCE.md`, `constants.ts`, `registerAnnotateExtension.ts`, `types.ts`; subfolders: `command/`, `format/`, `guards/`, `host/`, `runtime/`, `tool/`
- [`cmux`](./extensions/cmux.md) — files: `notifyCmuxPaneCompletion.ts`, `registerCmuxExtension.ts`, `syncCmuxPaneTitle.ts`; subfolders: `runtime/`, `state/`
- [`context-usage`](./extensions/context-usage.md) — files: `formatContextUsage.ts`, `registerContextUsageExtension.ts`
- [`exit-message`](./extensions/exit-message.md) — files: `formatExitMessage.ts`, `registerExitMessageExtension.ts`, `updateExitMessageFromSessionTitle.ts`; subfolders: `state/`
- [`fff`](./extensions/fff.md) — files: `index.ts`, `registerFffExtension.ts`; subfolders: `editor/`, `features/`, `grep/`, `read/`, `runtime/`, `shared/`
- [`generated`](./extensions/generated.md) — files: `registerCompiledEnabledExtensions.ts`
- [`rtk`](./extensions/rtk.md) — files: `registerRtkExtension.ts`; subfolders: `runtime/`, `tooling/`
- [`neo-editor`](./extensions/neo-editor.md) — files: `config.json`, `editor-triggers.json`, `getNeoConfigPath.ts`, `primeStartupResumeModal.ts`, `readNeoConfig.ts`, `registerNeoEditorExtension.ts`, `types.ts`; subfolders: `features/`, `shared/`
- [`notify`](./extensions/notify.md) — files: `registerNotifyExtension.ts`; subfolders: `runtime/`
- [`observations`](./extensions/observations.md) — files: `registerObservationsExtension.ts`; subfolders: `command/`, `shared/`, `summarizer/`, `tracker/`
- [`shared`](./extensions/shared.md) — subfolders: `observability/`, `two-pane-select-modal/`
- [`startup-hero`](./extensions/startup-hero.md) — files: `buildStartupHeroLines.ts`, `clearStartupHero.ts`, `getStartupHeroStatus.ts`, `getStartupHeroVersion.ts`, `hasResumeCliFlag.ts`, `registerStartupHeroExtension.ts`, `showStartupHero.ts`, `startupHeroWidgetKey.ts`
- [`sub-agent-status-widget`](./extensions/sub-agent-status-widget.md) — files: `registerSubagentStatusWidgetExtension.ts`; subfolders: `runtime/`, `ui/`
- [`sub-agents`](./extensions/sub-agents.md) — files: `agent-manager.ts`, `agent-runner.ts`, `agent-types.ts`, `context.ts`, `createBundledAgents.ts`, `cross-extension-rpc.ts`, `custom-agents.ts`, `env.ts`, `group-join.ts`, `index.ts`, `invocation-config.ts`, `memory.ts`, `model-resolver.ts`, `output-file.ts`, `prompts.ts`, `skill-loader.ts`, `types.ts`, `worktree.ts`; subfolders: `agents/`, `context-providers/`, `rpc/`, `rpc-entry/`, `runtime/`, `tooling/`, `ui/`
- [`todo`](./extensions/todo.md) — files: `README.md`, `registerTodoExtension.ts`; subfolders: `model/`, `runtime/`, `storage/`, `ui/`
- [`tron`](./extensions/tron.md) — files: `index.ts`; subfolders: `activity/`, `collapse/`, `colors/`, `compact-tool-lines/`, `duration/`, `shared/`, `thinking/`, `toolcalls/`, `user-message/`

## Read this first

1. `src/extensions/runtime/registerBundledExtensions.ts`
2. `src/extensions/runtime/createBundledExtensionFactories.ts`

## Navigation notes

- Start with the runtime entry files when you need the boundary or registration flow, then jump into the component that matches the feature you are touching.
- Use the component map above as the one-level drill-down for this folder; deeper structure stays inside each component doc.
- `src/extensions/runtime/registerBundledExtensions.ts` is the source-mode extension entrypoint and registers only enabled extensions from the feature-flag registry.
- `src/extensions/runtime/createBundledExtensionFactories.ts` creates the inline extension factories used by `runApp`.
