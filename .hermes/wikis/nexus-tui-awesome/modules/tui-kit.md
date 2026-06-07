# Module: `packages/tui-kit`

Shared UI components and building blocks for the TUI. Provides reusable components for modals, overlays, and picker UI across the application.

## Responsibilities

- Shared UI components: modal dialogs, overlays, picker UI
- Reusable two-pane modal: selection modal with split view
- Component library for consistent TUI styling

## Key Files

- `packages/tui-kit/src/` — Shared UI components and building blocks
- `src/two-pane-select-modal/` — Two-pane modal for extension/mini-app selection

## Public API

### UI Components
- Two-pane modal with selection list and detail pane
- Reusable picker UI for extension and feature selection

## Internal Structure

Small component library focused on modal and picker UI. Components are designed for reuse across the application.

## Dependencies

- **Uses:** `@nexus/types` (shared types)
- **Used by:** `apps/tui` (startup screen, CLI modals), `@nexus/extensions` (extension selection)

## Notable Patterns / Gotchas

- Check `src/extensions/shared/` before creating new overlay or picker UI
- Components are designed for reuse, not duplication
- Consistent styling across all modal UI
