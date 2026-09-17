# Assistant error row

A provider error renders as a closed error box at the end of the assistant message. The box is fully closed — a top border, side borders around the wrapped error text, and a bottom border — and it is colored with the `error` theme color. It renders only when the message has no visible tool calls and stops with an error. An abort renders as a plain red error line with no box.

## Closed box

The error box is standalone and not a member of the [[features/assistant-frame/assistant-activity-chain|assistant activity chain]]. It does not share walls with the blocks above it. The block immediately above the error closes its own bottom border, so the box reads as a separate card rather than an open connector.

A half-open box (side borders only, with no top or bottom) is rejected and stays rejected. It blends into the chain above and reads as a continuation of the previous block rather than as a terminal error.

## Text

The box shows the message's error text, formatted and wrapped to the box's inner width. When the message carries no error text, the box shows a default error string.
