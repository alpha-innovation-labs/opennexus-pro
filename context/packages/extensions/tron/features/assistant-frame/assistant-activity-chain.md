# The assistant activity chain

One assistant message renders as a single bordered chain. Its content blocks — thinking, text, and tool calls — draw shared walls so the whole turn reads as one box rather than a stack of separate boxes. The first block opens the chain with a top border, the last block closes it with a bottom border, and every block in between drops the wall its neighbor already draws. The chain is built by the assistant message render hook, which walks the message content in order and sets each block's top and bottom border from its neighbors. See [[features/assistant-frame/bordered-assistant-text|bordered-assistant-text]], [[features/assistant-frame/assistant-error-row|assistant-error-row]], and [[features/assistant-frame/thinking-tool-bridge|thinking-tool-bridge]].

## Block order

The hook walks the message content in array order. A `text` block renders as a [[features/assistant-frame/bordered-assistant-text|bordered assistant text]]. A `thinking` block renders as a bordered preview when the thinking block is hidden, and as bordered italic Markdown when it is expanded. The expanded border starts with the thinking icon in its top-left header and wraps at the available inner width. Tool calls render as compact single-line rows from the [[features/tool-call/compact-tool-error|tool call]] surface. The `Agent` tool is excluded from the chain; it never contributes a visible row.

## Shared walls

Two adjacent blocks share exactly one wall. The lower block suppresses its own top border, and the block above opens that wall with a `├─┤` bottom border. A collapsed or expanded thinking block opens a bottom `├─┤` when a bordered block follows; a bordered text block opens a bottom `├─┤` when a contiguous tool call group follows; a bridged tool call drops its top border to sit against the wall above it. Where no block follows, the chain closes with a `╰╯` or `└┘` bottom border.

Drawing a second `├─┤` at a junction is rejected and stays rejected. It renders as a doubled wall with a visible gap, which is why the lower block always suppresses its top border instead of drawing its own connector.

## Chain end

An assistant-level error or abort ends the chain. When the message stops with an error, a [[features/assistant-frame/assistant-error-row|assistant error row]] renders after the content, and the block immediately above it closes its own bottom border so nothing opens into the error box. The error box is a closed standalone box, not a member of the chain.
