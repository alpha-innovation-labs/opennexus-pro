# Status line layout

The promptline status line is one frame built from fixed slots. Left to right: the provider/model/thinking badges, the session title, flexible padding, then the right-aligned labels. The right-aligned cluster joins the optional active-agent counts, the TPS label, and the runtime label (`⏱ …`, session elapsed), in that order. Agent counts appear while running or queued agents exist; runtime appears when the session has conversation messages and a title.

## The composition

The title is the only slot that shrinks. The builder measures the badges, the right-side label (agent counts + TPS + runtime), and the gaps, then truncates the title to whatever width remains. When the frame is too narrow for the title at all, the badges plus the right-side label are truncated as a unit.

## Shared right-hand cluster

Agent counts, TPS, and runtime share one label rather than occupying separate slots. This keeps the builder simple (one right-aligned parameter) and avoids a second truncation boundary. The combined string is always present because the TPS slot never collapses (it renders dashes when idle), so the right edge of the frame is stable across turns.

## The render cache

The widget caches its rendered lines behind a key of width, frame width, model, provider, thinking level, title, the formatted TPS label, the agent-count label, and the runtime label. The formatted TPS label (including its ANSI color codes) is part of that key: the engine's 500 ms refresh tick produces a new label string while generating, and a reading change (or the value it snapshots at stream end) is what makes the next render differ. Omitting it from the key is the failure mode where the label freezes at its first value for the rest of the turn. Agent-count changes also invalidate the rendered row independently of assistant streaming; their session-scoped event bridge is described in [[context/packages/extensions/subagent-tintin/neo-agent-counts|Neo agent counts]].

## Always-present label

The TPS slot never collapses. When there is no reading — before the first stream, or a degenerate sample that rounds to zero — the slot renders a dash for each value with the bolt between them (`— ⚡ —`) in the idle color instead of disappearing. Because the slot is always present, the combined right-hand label is always non-empty, and the builder does not need to handle a missing TPS slot.
