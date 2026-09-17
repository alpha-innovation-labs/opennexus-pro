# The TPS engine

The engine is a module-level singleton with one live measurement at a time: a delta buffer of timestamped token counts, a running token total, a generating-start timestamp, a pause accumulator, and two latest meaningful readings (`lastLiveTps` and `lastAverageTps`). Two metrics are computed from the same buffer, and both are shown in the label at all times.

## Sliding-window TPS

The live reading sums the tokens whose timestamps fall inside the last 1000 ms and divides by the span between now and the oldest token in the window. The span is clamped to a 100 ms floor before the division, and the reading is zero unless at least two deltas exist and a stream is in flight.

The floor exists for burst-and-stall streams. When a provider buffers output and flushes it in one step, every token in the burst lands on nearly the same timestamp and the raw span is close to zero; dividing by that span reports the burst size, not the throughput. Extending the span to the 100 ms floor makes the reading include the gap the provider spent silent. A genuine burst spread over real time keeps its true timestamps and is unaffected.

## Average TPS

The average reading is the overall average: total tokens divided by effective generating seconds. Effective time is the wall span since generating start minus accumulated pauses, and minus any pause still in progress. The average is zero when the effective span is under 0.1 s, rather than dividing by a near-zero denominator.

Each arriving delta samples `round(sliding window)` and `round(average)` independently. A positive reading replaces its stored value; insufficient data or a value that rounds to zero leaves that metric's previous value intact. Sampling uses delta arrival time rather than a later repaint or stream-end event, so provider silence and tool waits cannot age the last sample out of the window or dilute the displayed average.

`beginTpsStreaming()` resets the buffer, totals, generating clock, and pause state for each assistant message without clearing the displayed readings. Each metric retains its last meaningful value until the new message supplies a replacement. Empty messages and delayed stream-end events preserve both readings. `resetTpsTracker()` clears measurement and display state together for a new session.

## Pause and resume

The tracker exposes `pauseTpsTimer()` and `resumeTpsTimer()` for pausing the clock around non-generating tool calls. Pause records a start timestamp; resume adds the pause span to the accumulator, and the accumulator subtracts tool-processing wall time from effective generating time. Pausing is a no-op unless a stream is in flight, and double-pause is ignored. These functions are not wired to event handlers.

The accumulator is cleared two ways: at stream end (the delta-time samples have already consumed it) and at turn boundary via `resetTurnPauseAccumulator()`, which is called on the `turn_end` event.

## Reading value

The engine exposes `getPromptlineTpsLabel()` which returns a formatted ANSI string. It returns the stored `lastLiveTps` and `lastAverageTps` during and after streaming; reading the label does not resample elapsed wall time. The method calls `formatPromptlineTpsLabel(current, avg)` from the formatter module, which produces the final styled label: both values in gray, the bolt separator speed-colored by the live figure, and dashes only for metrics without a meaningful reading in the session.

## Memory bound

The delta buffer compacts when it passes 5000 entries: entries older than twice the window are dropped. Compaction is safe because neither metric reads beyond the window, except the total token count, which is kept separately.
