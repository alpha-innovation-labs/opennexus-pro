# Agent modals and focus

Tintin's agent menus, conversation viewer, and workflow inspector use Nexus shared modal chrome and keyboard conventions. The shared shell standardizes borders, titles, pane focus, scrolling, and visible action hints without removing domain functionality. Fleet navigation requires explicit focus and does not intercept another modal's input.

## Modal surfaces

The agent menu retains running-agent access, agent types, agent creation and editing, settings, and schedules. Settings preserve their values and controls, including visibility, mention, execution, and viewer preferences. Scheduling controls retain their existing feature gating and operations rather than becoming informational placeholders.

The conversation viewer retains live updates, historical messages, tool details, scrolling, Markdown modes, steering/message input, and stopping. The workflow inspector retains phase and agent drill-down, detail expansion, conversation access, filtering, run termination, pause/resume, and eligible retry/skip actions. Actions use the existing manager and workflow control callbacks with their existing eligibility checks; modal styling does not redefine what pause, stop, retry, or skip does.

Tintin's `src/index.ts` owns menu and settings dispatch. `src/ui/conversation-viewer.ts`, `workflow-dialog.ts`, `workflow-menu.ts`, and `schedule-menu.ts` supply the domain views and actions. `src/ui/shared-dialog.ts` adapts Nexus's `packages/tui-kit/src/modal/SharedModal.ts` into `AgentDialogFrame`, `AgentSelectDialog`, and `AgentSettingsDialog`. Domain views retain their state and callbacks; the shared shell owns framing. `selectAgentOption` uses the host's select protocol when custom UI is unavailable or does not mount, including RPC hosts. Typed input, text editing, and agent delete/reset confirmation retain their host UI APIs.

## Agent management and settings

An ejected or overridden built-in agent still offers Reset to default while embedded defaults are enabled. Default identity is recognized by its registered name as well as its config marker; resetting removes the override file and reloads the embedded definition.

Numeric settings use typed prompts instead of cycling values. Background concurrency and grace turns require safe integers of at least one; foreground concurrency, default max turns, and nested depth accept safe integers of zero or greater. Invalid values re-prompt without applying or persisting them, and cancellation leaves the setting unchanged. Cycling a nonnumeric setting refreshes derived labels and values without remounting the dialog or losing its selected setting and pane focus.

## Responsive framing

Dialog overlays use 90% of terminal width and at most 70% of terminal height. Conversation rendering budgets borders, agent identity, action hints, and an active steering composer before allocating history rows. On short terminals the history viewport can shrink to zero while the draft and send/cancel controls remain visible; invocation details and the separate navigation-hint row appear only with enough height.

The workflow inspector preserves the run name and detail-pane access in its compact layout. Eligible key/action hints wrap together rather than being clipped as one long footer. The actual remaining height determines list windows and detail scrolling, keeping selection and expanded content reachable after resize.

## Keyboard ownership

An explicit, discoverable fleet-focus action enters fleet navigation and visibly marks the selected row. Bare Left or Down in an empty prompt does not implicitly seize focus. While the fleet is unfocused, editing, history, and Neo trigger pickers keep their keys. Fleet input handling requires positive ownership; an unknown focus state is not treated as permission to intercept.

Within a focused fleet, navigation moves among visible and overflow entries, activation opens the selected conversation or workflow, and cancel returns focus to the editor. Opening any modal suspends fleet interception. A modal's own text inputs receive text and editing keys rather than unrelated navigation or destructive-action shortcuts. Closing a modal restores a valid prior focus target; no global listener steals its cancel, arrow, or submit keys.

The fleet-focus binding is **Alt+Shift+F**, advertised above the fleet rows. It only activates from an empty, positively focused Pi `CustomEditor` (including Neo), never from a generic modal `Editor`. Visible overlays suspend interception, and the selected fleet row remains available when the prompt regains focus. Unknown focus fails closed. Fleet focus also requires room for its hint and a selected row; a zero-row or summary-only budget returns keyboard ownership to the editor, including after resize. Expanding the terminal requires explicit activation again.

The workflow detail pane uses Tab to switch between agent selection and detail scrolling. Detail-pane arrows, page keys, Home, and End scroll the expanded prompt and outcome; run-changing keys stay in the selection pane. Settings keep their typed numeric prompts and cycling values, with Tab opening the scrollable description pane.

## Shared navigation and action hints

List navigation, selection, cancellation, pane switching, and scrolling follow Nexus shared controls and configured keybindings. Page and start/end navigation remain available for long conversations and workflow details. Domain-specific steering, stopping, pause/resume, retry, and skip controls remain discoverable in the modal's action hints and are only active in the appropriate pane and state. Keyboard release events do not execute actions twice.

Visual unification preserves all functional features; it is not a conversion of interactive inspectors into static previews. [[compact-fleet]] describes the compact entry surface, while [[tron-progress]] preserves progress in the transcript independently of modal focus.
