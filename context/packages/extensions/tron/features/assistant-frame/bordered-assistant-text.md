# Bordered assistant text

Assistant text renders inside a border. The border's corners adapt to the blocks directly above and below so the text joins the [[features/assistant-frame/assistant-activity-chain|assistant activity chain]] instead of standing alone. The text passes through the standard Markdown renderer, so inline code, bold, and other Markdown styling render as they do elsewhere in the transcript.

## Corners

The top border is drawn unless the block sits directly under a collapsed or expanded thinking block. In that case the thinking block already draws a `├─┤` bottom wall, so the text suppresses its own top border to share that single wall. The bottom border is a `├─┤` when a contiguous tool call group follows and no error or abort ends the message, and a `╰╯` otherwise. The side borders are always `│`.

| Neighbor above | Neighbor below | Top | Bottom |
| --- | --- | --- | --- |
| none | none | `╭╮` | `╰╯` |
| collapsed or expanded thinking | none | suppressed | `╰╯` |
| none | tool calls | `╭╮` | `├┤` |
| collapsed or expanded thinking | tool calls | suppressed | `├┤` |

## Shared top wall

Sharing the top wall is the same mechanism the chain uses at every junction: the lower block suppresses its top border and the block above opens the wall. The text block therefore suppresses its top border rather than drawing a second `├─┤`. Drawing the second `├─┤` is rejected and stays rejected because it renders a doubled wall with a visible gap.

The top border is suppressed beneath both collapsed and expanded thinking. Expanded thinking keeps its italic Markdown inside a border with the thinking icon at the top-left of its header. No spacer separates its bottom junction from the following text.

## Duration label

When the assistant hook supplies a duration label, the closing bottom border places it at the right edge, immediately before the closing corner: `└─── ⏱ 25s ┘`. The label keeps its muted styling and surrounding spaces; the horizontal border fills the remaining width to its left. A bottom wall that connects to tools does not display the duration.

## Chain end

When the message stops with an error or abort, the text closes with `╰╯` even if tool calls follow. A `├─┤` would otherwise open into the [[features/assistant-frame/assistant-error-row|assistant error row]] or an abort line.
