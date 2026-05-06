# Workspace extension

This extension manages cross-session workspace navigation and the session top bar.

## What we found

- Pi exposes `switchSession()` and `newSession()` on `ExtensionCommandContext`.
- Slash commands receive `ExtensionCommandContext`.
- Keyboard shortcuts only receive `ExtensionContext`.
- That means a shortcut can open UI and read session data, but it cannot directly switch sessions.
- When we tried to switch from a shortcut-opened modal, Pi raised:
  - `ctx.switchSession is not a function`

## Why this workaround exists

We still wanted `ctrl+;` to feel like a direct session switcher.

Since shortcuts can write into the editor, and the custom Neo editor can detect configured trigger text, we use a two-step workaround:

1. the workspace shortcut writes `/sessions` into the editor
2. the shortcut also updates a shared trigger config file
3. the Neo custom editor sees `/sessions`
4. the Neo editor auto-submits that text
5. Pi executes `/sessions` as a real command
6. the command runs with `ExtensionCommandContext`
7. session switching works

## Files involved

1. `registerWorkspaceExtension.ts` wires the top bar, `/sessions`, and `ctrl+;`
2. `top-bar/*.ts` reserves editor space for the fixed top overlay
3. `primeSessionsShortcut.ts` primes the editor and trigger config
4. `showSessionsModal.ts` shows the actual sessions modal
5. `WorkspaceSessionsModal.ts` renders the modal UI
6. `../neo-editor/features/editor-triggers/*.ts` stores and resolves editor submit triggers
7. `../neo-editor/registerNeoEditorExtension.ts` watches editor text and auto-submits matching triggers

## Why not call the modal directly from the shortcut?

Because opening the modal from shortcut context is allowed, but selecting a session still needs `switchSession()`, and that function is not available on shortcut context.

## Important implementation detail

The first Neo trigger attempt used `onChange`, but Pi overwrote the custom editor's `onChange` during editor wiring.

So the working solution checks triggers from:

- `PromptlineEditor.setText()`
- `PromptlineEditor.handleInput()`

That avoids Pi's `onChange` replacement path and keeps auto-submit reliable.
