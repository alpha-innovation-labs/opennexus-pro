# Tool-call interaction

In the fullscreen transcript, a completed left click on a tool-call box toggles that tool's result expansion. The call header toggles the per-tool expansion state. Expanded result bodies consume clicks without collapsing so their output remains selectable and scrollable. A tool with no result does not toggle; partial results can expand while output streams.

## Mouse coordinates

The platform's `applyToolExecutionSpacingPatch` removes Pi's leading blank row so adjacent Tron frames meet. It records the removed row alongside the rendered dimensions and translates mouse events back into Pi's original row coordinates. This keeps the first border clickable and prevents clicks from spilling into adjacent tools or hidden rows.

Pi's existing tool mouse regions own the toggle, rather than a second Tron click handler. Child controls retain priority, press and drag events do not expand output, and keyboard focus stays with the editor. Streaming updates and resize retain each tool's expansion state; the global tool-expansion shortcut uses the same state through `setExpanded`.

## Expanded output viewport

In fullscreen mode, expanded tool output displays at most 30 terminal rows, with the call header and frame borders outside that limit. The platform marks the renderer context with viewport availability; regular terminal mode keeps output uncapped because it does not dispatch these scrolling interactions. Overflow shows an internal scrollbar: the mouse wheel scrolls the output, clicking the track moves the thumb, and dragging the thumb changes the visible range. At a scroll boundary, wheel input falls through to the surrounding transcript. Short output uses its natural height and has no scrollbar.

The scroll offset belongs to Pi's per-tool renderer state, not the temporary result component. It survives streaming updates, repaint, resize, and collapse/re-expansion, and clamps when the output becomes shorter. Body clicks do not collapse the tool; press and drag over text remain available for selection, while the header stays the expand/collapse target. The cap also applies to extension results and expanded Agent/workflow output, without changing their collapsed progress view.

## Edit and write details

Expanded writes show the full submitted `content`, not the success receipt or the compact first-line preview. An empty write has an explicit empty-file label. Expanded edits show the recorded result diff; when no diff is available, they show the old/new text for every submitted replacement, including legacy single-replacement arguments. These detail views use the captured arguments and result only: they do not reread changed files or run the tool's call-preview renderer. Failed mutations show the error instead of presenting attempted content as a successful change.

## Rendering

Expansion changes presentation only and never executes the tool again. Extension result renderers receive their own previous child as `lastComponent`, not Tron's surrounding border; built-in renderers receive no previous wrapper. This separation prevents expanding a result from invoking child-specific methods on a border component. Tools other than edit and write retain their existing result renderers; all tools retain their shared frame borders. Agent and workflow tools retain their live collapsed progress, with their existing detailed renderers used for expanded output. Failed tools retain the [[compact-tool-error|compact error presentation]].
