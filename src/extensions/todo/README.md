# Todo extension

## Purpose

A project-scoped todo modal for Pi, opened with `Ctrl+\`.

## What this extension does

- Opens a modal with:
  - todos in the main body
  - input anchored at the bottom
- Uses Vim-like modes:
  - `normal` for navigation and actions
  - `add` for creating a new todo
  - `edit` for editing the selected todo
- Shows inline help with `?`
- Persists todos per project `cwd`

## Key decisions learned during implementation

### 1. Storage must be project-scoped

Todos should not be global.
They are stored under the agent data directory in a sibling `todo/` folder, separate from `observations/`.
Each project gets its own file keyed by `cwd`.

### 2. Pi's `ExtensionEditorComponent` is a wrapper

The extension editor wrapper does **not** expose `setText()` directly.
To programmatically edit the input, access the wrapped inner editor.
That is why this extension uses helper files like:

- `ui/getTodoInputEditor.ts`
- `ui/setTodoInputText.ts`

### 3. Rendering the wrapper causes visual bugs

Rendering the wrapper directly caused bad input visuals:

- hidden typed text
- duplicated title chrome
- broken layout

The correct approach is to render the inner editor content, then place that content inside custom todo chrome.

### 4. Layout is sensitive in Pi overlays

The todo modal needed several iterations to get right:

- list should stay above the input
- input should stay centered
- modal border and input border must not visually collide
- completed items can pin to the top while open items stay close to the input

This extension now treats list layout and input layout as separate concerns.

### 5. Color consistency matters

To match Neo editor styling, the todo input uses the same red family for:

- input border
- cursor prompt marker
- selected item text
- modal title
- mode badge

The outer modal frame stays neutral where appropriate.

### 6. Sorting behavior is part of the UX

The current behavior is intentional:

- completed items sort to the top
- open items stay lower, near the input
- each item shows a compact relative age on the right

This makes active editing happen near the bottom while still keeping completed work visible.

## Current controls

### Global

- `Ctrl+\` open todo modal
- `Ctrl+C` hide modal

### Normal mode

- `j` / `k` move
- `gg` jump to first
- `G` jump to last
- `a` add new todo
- `e` edit selected todo
- `x` toggle complete
- `dd` delete selected todo
- `?` toggle help

### Add/Edit modes

- `Enter` save
- `Esc` return to normal mode
- `?` open help

### Help mode

- `Esc` return to the previous mode
- `?` close help

## Module layout

- `model/` todo data shapes and sorting
- `storage/` project-scoped persistence
- `runtime/` state transitions and list mutations
- `ui/` modal rendering and input helpers

## Notes for future changes

- Keep files small and single-purpose.
- Be careful when changing editor rendering.
- Test both empty-state and long-list layout.
- Treat selection, sorting, and spacing as behavior, not cosmetic details.
