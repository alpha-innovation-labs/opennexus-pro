# Assistant footer

The assistant message ends with a duration footer that names the agent and the turn duration (`<label> · <duration>`), colored with the `muted` theme color. It renders only when the message has visible content, no tool calls, and a duration label. The footer is the terminal caption of a completed turn; the [[features/assistant-frame/assistant-error-row|assistant error row]] (abort or error) that ends a failed turn reads at the same weight because both sit one blank line from their visible neighbor.

## Caption

The footer joins the agent label and the compact turn duration with a middle dot. The label comes from the agent-label source (an environment override, else the app name). The duration is the compact timing recorded for the turn. The footer is a plain text component at the default vertical padding, so it contributes one blank line above and one below itself.

## Spacing

The footer carries no explicit spacer. Its one blank line above and below come from the text component's own top and bottom padding. The abort line is a text component with no vertical padding and a single explicit spacer above it (suppressed on a thinking-only message).

Keeping a leading spacer on the footer is rejected and stays rejected: that spacer plus the footer's own top padding would stack two blank lines above the label, and the footer's bottom padding plus the following prompt's spacer would stack two below it. The abort caption sits one line below the prompt above it, so a spacer on the footer makes the caption read heavier than the abort.

## Cross-message gap

Pi places one blank line before every non-first user message. That spacer is the separator between the assistant message and the following prompt. When the assistant message rendered the footer, Tron marks the assistant component with a footer flag, and the platform layer that owns `addMessageToChat` drops the following user message's leading spacer when the component directly before it carries the flag. The next prompt then sits one blank line below the footer instead of two. The flag is reset on every render and set only when the footer is actually appended, so a re-render that no longer shows the footer also drops the mark and leaves the normal prompt spacing in place.
