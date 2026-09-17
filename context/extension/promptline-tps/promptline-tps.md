# Promptline token speed

The neo-editor promptline shows token-per-second throughput while the assistant streams. The reading is a compact two-value label (the current live TPS, a speed-colored bolt separator, and the running average TPS, e.g. `142 ⚡ 87`) that is concatenated with the session runtime label and placed at the right edge of the promptline status line. Both values render in gray; only the bolt separator is speed-colored. It persists after the stream ends until the next turn produces a new reading. The separator is the FontAwesome bolt glyph (`\uf0e7`), chosen to match the Nerd-Font PUA icon family the promptline already uses rather than an out-of-style emoji. The slot is always present: before any stream it renders a dash for each value with the bolt between them in the idle color rather than collapsing. It inherits the status line's width and truncation; it has no settings surface of its own.

## The three parts

- **The TPS engine** owns the measurement state: a timestamped delta buffer, a pause accumulator, and the last completed readings (live and average). All token counting and TPS arithmetic lives in this module. It also calls the formatter to produce the final label string. See [[tps-engine]].
- **The event wiring** feeds the engine from pi lifecycle events and wakes the renderer on a fixed cadence while a stream is in flight. See [[event-wiring]].
- **The status line layout** concatenates the TPS label with the runtime label and places the combined string at the right edge of the promptline frame. See [[status-line-layout]].

## The loop

A turn starts and the engine is reset. Each streaming delta is recorded with a timestamp. While generating, the renderer refreshes on a fixed interval rather than on every delta, which keeps the label from flickering at high throughput. The stream ends and the engine snapshots both readings independently; the label holds those snapshots until the next turn.

```text
reset -> record deltas -> snapshot both readings at stream end
```

## Why an internal tracker

The engine is a port of the pi-token-speed package's measurement core, kept inside neo-editor instead of a dependency on the package. See [[why-internal-tracker]].
