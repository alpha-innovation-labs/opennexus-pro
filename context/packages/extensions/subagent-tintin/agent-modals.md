# Agent modals and focus

Tintin's agent menus, conversation viewer, and workflow inspector use Nexus shared modal chrome and keyboard conventions. The shared shell standardizes borders, titles, pane focus, scrolling, and visible action hints without removing domain functionality. Fleet navigation requires explicit focus and does not intercept another modal's input.

## Modal surfaces

The agent menu retains running-agent access, agent types, agent creation and editing, settings, and schedules. Settings preserve their values and controls, including visibility, mention, execution, and viewer preferences. Scheduling controls retain their existing feature gating and operations rather than becoming informational placeholders.

The conversation viewer retains live updates, historical messages, tool details, scrolling, Markdown modes, steering/message input, and stopping. The workflow inspector retains phase and agent drill-down, detail expansion, conversation access, filtering, run termination, pause/resume, and eligible retry/skip actions. Actions use the existing manager and workflow control callbacks with their existing eligibility checks; modal styling does not redefine what pause, stop, retry, or skip does.

Tintin's `src/index.ts` owns menu and settings dispatch. `src/ui/conversation-viewer.ts`, `workflow-dialog.ts`, `workflow-menu.ts`, and `schedule-menu.ts` supply the domain views and actions. Nexus's `packages/tui-kit/src/modal/SharedModal.ts` and select-preview shell provide reusable framing and pane behavior, not replacements for these domain models.

## Keyboard ownership

An explicit, discoverable fleet-focus action enters fleet navigation and visibly marks the selected row. Bare Left or Down in an empty prompt does not implicitly seize focus. While the fleet is unfocused, editing, history, and Neo trigger pickers keep their keys. Fleet input handling requires positive ownership; an unknown focus state is not treated as permission to intercept.

Within a focused fleet, navigation moves among visible and overflow entries, activation opens the selected conversation or workflow, and cancel returns focus to the editor. Opening any modal suspends fleet interception. A modal's own text inputs receive text and editing keys rather than unrelated navigation or destructive-action shortcuts. Closing a modal restores a valid prior focus target; no global listener steals its cancel, arrow, or submit keys.

## Shared navigation and action hints

List navigation, selection, cancellation, pane switching, and scrolling follow Nexus shared controls and configured keybindings. Page and start/end navigation remain available for long conversations and workflow details. Domain-specific steering, stopping, pause/resume, retry, and skip controls remain discoverable in the modal's action hints and are only active in the appropriate pane and state. Keyboard release events do not execute actions twice.

Visual unification preserves all functional features; it is not a conversion of interactive inspectors into static previews. [[compact-fleet]] describes the compact entry surface, while [[tron-progress]] preserves progress in the transcript independently of modal focus.
