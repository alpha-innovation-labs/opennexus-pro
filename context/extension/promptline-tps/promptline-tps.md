# Promptline token speed

The neo-editor promptline shows token-per-second throughput while the assistant streams. The reading is a compact two-value label (the current live TPS, a speed-colored bolt separator, and the running average TPS, e.g. `142 ⚡ 87`) that shares the right edge of the promptline status line with optional active-agent counts before it and the session runtime label after it. Both values render in gray; only the bolt separator is speed-colored. It persists after the stream ends until the next turn produces a new reading. The separator is the FontAwesome bolt glyph (`\uf0e7`), chosen to match the Nerd-Font PUA icon family the promptline already uses rather than an out-of-style emoji. The slot is always present: before any stream it renders a dash for each value with the bolt between them in the idle color rather than collapsing. It inherits the status line's width and truncation; it has no settings surface of its own.

## The three parts

- **The TPS engine** owns the measurement state: a timestamped delta buffer, a pause accumulator, and the latest meaningful readings (live and average). All token counting and TPS arithmetic lives in this module. It also calls the formatter to produce the final label string. See [[tps-engine]].
- **The event wiring** feeds the engine from pi lifecycle events and wakes the renderer on a fixed cadence while a stream is in flight. See [[event-wiring]].
- **The status line layout** combines optional active-agent counts, the TPS label, and runtime into the right-aligned cluster of the promptline metadata row. See [[status-line-layout]].

## The loop

An assistant message starts a fresh measurement without clearing the displayed readings. Each streaming delta is recorded with a timestamp and updates whichever metrics have enough data. While generating, the renderer refreshes on a fixed interval rather than on every delta, which keeps the label from flickering at high throughput. The last meaningful values remain visible through provider silence, tool execution, stream end, and the next message's initial wait. Only a session reset clears them back to dashes.

```text
reset measurement -> sample arriving deltas -> retain readings through waits
```

## Why an internal tracker

The engine is a port of the pi-token-speed package's measurement core, kept inside neo-editor instead of a dependency on the package. See [[why-internal-tracker]].
