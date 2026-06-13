# E2E Testing Harness — Full File & Folder Inventory

> Generated: 2026-06-12
> Scope: All files and folders referencing the virtual-terminal harness, pi-test-harness, or related e2e testing infrastructure.

---

## 1. Core Harness Infrastructure

These are the foundational files that power the e2e testing system:

| File | Purpose |
|------|---------|
| `test/support/terminal/VirtualTerminal.ts` | Headless xterm wrapper — the core terminal emulator for deterministic TUI rendering |
| `test/support/render/renderComponentInVirtualTerminal.ts` | Render helper — creates a TUI, mounts a component, waits for render, returns viewport lines |

---

## 2. E2E Test Files — By Feature Directory

All test files under `test/e2e/` and `test/extensions/` that import `VirtualTerminal` or `renderComponentInVirtualTerminal`.

### 2.1 `test/e2e/auto-update/`

| File | Description |
|------|-------------|
| `test/e2e/auto-update/autoUpdateModal.test.ts` | Auto-update modal rendering |

### 2.2 `test/e2e/automations/`

| File | Description |
|------|-------------|
| `test/e2e/automations/automationsModal.test.ts` | Automations modal picker rendering |

### 2.3 `test/e2e/cmux/`

| File | Description |
|------|-------------|
| `test/e2e/cmux/cmuxPaneDoneNotification.test.ts` | Cmux pane done notification (direct `VirtualTerminal` import) |

### 2.4 `test/e2e/context-usage/`

| File | Description |
|------|-------------|
| `test/e2e/context-usage/contextUsageVirtualTerminal.test.ts` | Context usage modal rendering |

### 2.5 `test/e2e/feature-management/`

| File | Description |
|------|-------------|
| `test/e2e/feature-management/featuresModal.test.ts` | Features modal picker rendering |

### 2.6 `test/e2e/hotkeys/`

| File | Description |
|------|-------------|
| `test/e2e/hotkeys/hotkeysEditVirtualTerminal.test.ts` | Hotkey editor — multiple render assertions (direct `VirtualTerminal` import) |

### 2.7 `test/e2e/login-import/`

| File | Description |
|------|-------------|
| `test/e2e/login-import/groupedLoginActionSelector.test.ts` | Login action selector modal |

### 2.8 `test/e2e/memory/`

| File | Description |
|------|-------------|
| `test/e2e/memory/memoryModalFileTree.test.ts` | Memory modal file tree rendering |
| `test/e2e/memory/memoryToolNoLeadingSpacer.test.ts` | Memory tool — leading spacer suppression |

### 2.9 `test/e2e/neo-editor/`

| File | Description |
|------|-------------|
| `test/e2e/neo-editor/promptlineStatusOwnershipVirtualTerminal.test.ts` | Prompt line status ownership widget |

### 2.10 `test/e2e/observations/`

| File | Description |
|------|-------------|
| `test/e2e/observations/observationsModalPromptHotkey.test.ts` | Observations modal — prompt hotkey display (2 render assertions) |

### 2.11 `test/e2e/pi-packages/`

| File | Description |
|------|-------------|
| `test/e2e/pi-packages/piPackagesModal.test.ts` | Pi packages modal rendering |

### 2.12 `test/e2e/prompts/`

| File | Description |
|------|-------------|
| `test/e2e/prompts/systemPromptModal.test.ts` | System prompt modal — multiple system/render assertions (4 render calls) |

### 2.13 `test/e2e/rtk/`

| File | Description |
|------|-------------|
| `test/e2e/rtk/savingsModelPanelVirtualTerminal.test.ts` | Savings model panel — multiple render assertions (direct `VirtualTerminal` import) |

### 2.14 `test/e2e/skills/`

| File | Description |
|------|-------------|
| `test/e2e/skills/linearCliSkillPreviewVirtualTerminal.test.ts` | Linear CLI skill preview modal |
| `test/e2e/skills/toolsSlashMenuVirtualTerminal.test.ts` | Tools slash menu — 7 render assertions across multiple tool outputs |

### 2.15 `test/e2e/slash-menu/`

| File | Description |
|------|-------------|
| `test/e2e/slash-menu/modelCatalogVirtualTerminal.test.ts` | Model catalog modal |
| `test/e2e/slash-menu/startupResumeModalInput.test.ts` | Startup resume modal input (direct `VirtualTerminal` import) |

### 2.16 `test/e2e/startup-hero/`

| File | Description |
|------|-------------|
| `test/e2e/startup-hero/startupHeroContent.test.ts` | Startup hero content rendering |
| `test/e2e/startup-hero/startupHeroTruncation.test.ts` | Startup hero truncation behavior |

### 2.17 `test/e2e/sub-agents/`

| File | Description |
|------|-------------|
| `test/e2e/sub-agents/agentToolRendering.test.ts` | Agent tool rendering |
| `test/e2e/sub-agents/liveToolOutputWidget.test.ts` | Live tool output widget |

### 2.18 `test/e2e/tetris/`

| File | Description |
|------|-------------|
| `test/e2e/tetris/tetrisModal.test.ts` | Tetris modal rendering |

### 2.19 `test/e2e/tron/` — 19 files

| File | Description |
|------|-------------|
| `test/e2e/tron/collapsedToolGroupSummary.test.ts` | Collapsed tool group summary rendering |
| `test/e2e/tron/consecutiveToolCallsNoExtraSpacing.test.ts` | Consecutive tool calls — shared border stack (4 render assertions) |
| `test/e2e/tron/devAgentLabelFooter.test.ts` | Dev agent label footer |
| `test/e2e/tron/emptyThinkingTurnDoesNotSplitTools.test.ts` | Empty thinking turn — no tool splitting |
| `test/e2e/tron/failedToolCallErrorSummary.test.ts` | Failed tool call error summary |
| `test/e2e/tron/noThinkingOuterSpacer.test.ts` | No thinking outer spacer |
| `test/e2e/tron/noThinkingToolSpacer.test.ts` | No thinking tool spacer |
| `test/e2e/tron/noToolGroupSpacer.test.ts` | No tool group spacer |
| `test/e2e/tron/providerErrorFormat.test.ts` | Provider error format |
| `test/e2e/tron/resumedCollapsedToolGroupSummaryTiming.test.ts` | Resumed collapsed group summary timing |
| `test/e2e/tron/resumedFooterTiming.test.ts` | Resumed footer timing |
| `test/e2e/tron/thinkingBlockWidth.test.ts` | Thinking block width |
| `test/e2e/tron/toolOnlyFollowupStaysInThinkingGroup.test.ts` | Tool-only followup in thinking group |
| `test/e2e/tron/totalTurnFooterTiming.test.ts` | Total turn footer timing |
| `test/e2e/tron/transcript/consolidatedRenderer.test.ts` | Consolidated transcript renderer |
| `test/e2e/tron/writeToolPreviewStyling.test.ts` | Write tool preview styling |

### 2.20 `test/e2e/wallet/`

| File | Description |
|------|-------------|
| `test/e2e/wallet/walletModalVirtualTerminal.test.ts` | Wallet modal rendering |

### 2.21 `test/e2e/web-search/`

| File | Description |
|------|-------------|
| `test/e2e/web-search/webFetchVirtualTerminal.test.ts` | Web fetch rendering |

---

## 3. Extension E2E Tests

Tests under `test/extensions/` that use the harness:

### 3.1 `test/extensions/dev/`

| File | Description |
|------|-------------|
| `test/extensions/dev/devModal.test.ts` | Dev modal rendering |
| `test/extensions/dev/sharedModal.test.ts` | Shared modal rendering |
| `test/extensions/dev/telemetryModal.test.ts` | Telemetry modal rendering |

### 3.2 `test/extensions/fff/`

| File | Description |
|------|-------------|
| `test/extensions/fff/renderSlashMenuParity.test.ts` | Slash menu parity (feature-flags extension) |
| `test/extensions/fff/settingsRuntimeParity.test.ts` | Settings runtime parity (feature-flags extension) |

### 3.3 `test/extensions/hotkeys/`

| File | Description |
|------|-------------|
| `test/extensions/hotkeys/hotkeysFullscreen.test.ts` | Hotkeys fullscreen rendering |

### 3.4 `test/extensions/neo-editor/`

| File | Description |
|------|-------------|
| `test/extensions/neo-editor/helpShortcutsModal.test.ts` | Help shortcuts modal |
| `test/extensions/neo-editor/renderNeoEditorChrome.test.ts` | Neo editor chrome rendering |
| `test/extensions/neo-editor/slashCommandSubmit.test.ts` | Slash command submit |
| `test/extensions/neo-editor/triggerModalVirtualTerminal.test.ts` | Trigger modal rendering |

### 3.5 `test/extensions/observations/`

| File | Description |
|------|-------------|
| `test/extensions/observations/renderObservationsModal.test.ts` | Observations modal rendering |

### 3.6 `test/extensions/startup-hero/`

| File | Description |
|------|-------------|
| `test/extensions/startup-hero/renderStartupHeroLogo.test.ts` | Startup hero logo rendering |

### 3.7 `test/extensions/sub-agents/`

| File | Description |
|------|-------------|
| `test/extensions/sub-agents/SubagentHistoryModal.test.ts` | Subagent history modal |
| `test/extensions/sub-agents/SubagentHistoryModalNavigation.test.ts` | Subagent history navigation |
| `test/extensions/sub-agents/SubagentHistoryModalPaneWidths.test.ts` | Subagent history pane widths |

### 3.8 `test/extensions/todo/`

| File | Description |
|------|-------------|
| `test/extensions/todo/renderTodoList.test.ts` | Todo list rendering |

### 3.9 `test/extensions/tron/`

| File | Description |
|------|-------------|
| `test/extensions/tron/renderTronInputBubble.test.ts` | Tron input bubble rendering |

---

## 4. Other Test Files Using the Harness

| File | Description |
|------|-------------|
| `test/pi-internals/applyInlineImageOverlayPatch.test.ts` | Inline image overlay patch test |

---

## 5. pi-test-harness References (submodule)

Files in `__references/nicobailon-pi-subagents/` that reference `@marcfargas/pi-test-harness`:

| File | Purpose |
|------|---------|
| `__references/nicobailon-pi-subagents/CHANGELOG.md` | Documents test suite (85 integration + 12 e2e) |
| `__references/nicobailon-pi-subagents/package.json` | Declares `@marcfargas/pi-test-harness@^0.5.0` |
| `__references/nicobailon-pi-subagents/test/e2e/e2e-sandbox-install.test.ts` | Verifies sandbox install via harness |
| `__references/nicobailon-pi-subagents/test/e2e/e2e-sandbox.test.ts` | Extension loading via harness |
| `__references/nicobailon-pi-subagents/test/e2e/e2e-tool.test.ts` | Subagent tool management/validation/single execution |
| `__references/nicobailon-pi-subagents/test/integration/single-execution.test.ts` | Mock pi CLI via harness |
| `__references/nicobailon-pi-subagents/test/support/helpers.ts` | Test helper with bare specifier imports |

---

## 6. Harness Mode (App Runtime)

| File | Purpose |
|------|---------|
| `apps/tui/src/runtime/harness/runHarnessMode.ts` | Dev-only `nexus dev-test` mode — conditionally imports `@marcfargas/pi-test-harness` |
| `apps/tui/src/runtime/harness/isHarnessModeEnabled.ts` | Checks whether harness mode is enabled |
| `apps/tui/src/runtime/harness/isHarnessModeEnabled.test.ts` | Harness mode enablement test |

---

## 7. Documentation & Plans Referencing the Harness

| File | Reference Type |
|------|----------------|
| `AGENTS.md` | Line 6: "Add deterministic e2e coverage for every new feature using the virtual-terminal test harness" |
| `docs/web-tools-extension-design.md` | Sections 5.4, 10: references virtual-terminal harness for full e2e tests |
| `plans/2026-06-12-user-commands-directory.md` | §Approach: "Use the existing virtual-terminal test harness pattern" |
| `social-automation.md` | Lines 37, 443: "Add deterministic e2e coverage with the virtual-terminal harness" |

---

## 8. Build/Bundled Artifacts

| File | Note |
|------|------|
| `.release/build/nexus.obfuscated.js` | Obfuscated release bundle (contains harness references) |
| `.release/bundle/package/package.json` | Published package metadata (declares harness dependency) |

---

## Summary Counts

| Category | Count |
|----------|-------|
| Core harness infrastructure files | 2 |
| E2E test files (`test/e2e/`) | 42 |
| Extension E2E test files (`test/extensions/`) | 19 |
| Other test files | 1 |
| pi-test-harness references (submodule) | 7 |
| Harness mode runtime files | 3 |
| Documentation/plans referencing harness | 4 |
| **Total unique files** | **~78** |
