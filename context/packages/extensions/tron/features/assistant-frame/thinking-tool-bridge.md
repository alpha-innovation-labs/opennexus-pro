# Thinking-to-tool bridge

Bridging is how adjacent activity rows share a wall instead of each drawing two. A tool call that follows a bordered block — a collapsed or expanded thinking block, or a bordered text block — is marked as bridged, and a bridged row drops its top border so it sits directly against the wall the block above opens. The set of bridged ids and the per-row top and bottom border decisions are module-level frame state, kept in sync with the assistant message content on every render.

## Thinking-box interaction

In the mouse-aware transcript, a completed left click on a thinking box toggles only that box between the compact preview and bordered Markdown. Press, drag, release, and other buttons do not toggle it. The preceding tool's closing border is outside the thinking click target. Per-box visibility survives streaming updates, invalidation, and resizing; the global thinking-visibility shortcut clears these overrides and applies its setting to every box. Clicks rebuild the assistant layout without changing keyboard focus or the shared thinking/text/tool walls.

## Frame state sync

On each assistant render the frame state is recomputed from the message content in order. The content is scanned for visible activities — a thinking block or a non-`Agent` tool call. A tool's top border is shown only when it is the first visible activity in the message; every other tool drops its top border. A tool's bottom border is shown only when it is the last visible activity or is followed by a thinking block.

Text blocks do not appear in this scan. They render as bordered content that carries its own junction borders, so the scan sees only the thinking and tool rows it must frame.

## Bridging across text

A thinking block reaches its tool calls by scanning forward for the contiguous tool group that follows it. The scan skips text blocks and stops at the next non-empty thinking block, or at the first block that is neither a tool call nor a text block. Skipping text is what lets a thinking block open a `├─┤` wall into a tool call that a text block separates it from, keeping the whole [[features/assistant-frame/assistant-activity-chain|assistant activity chain]] unbroken.

A bordered text block reaches its tool calls the same way, by collecting the contiguous tool call ids that immediately follow it. Both the thinking block and the text block mark those ids as bridged so their top borders are suppressed.
