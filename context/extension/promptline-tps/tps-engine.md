# The TPS engine

The engine is a module-level singleton with one live measurement at a time: a delta buffer of timestamped token counts, a fixed-capacity ring of recorded TPS readings, and two retained display values (`lastLiveTps` and `lastAverageTps`). Live TPS measures recent token throughput; average TPS is the arithmetic mean of the latest 1000 recorded live readings.

## Sliding-window TPS

The live reading sums the tokens whose timestamps fall inside the last 1000 ms and divides by the span between now and the oldest token in the window. The span is clamped to a 100 ms floor before the division, and the reading is zero unless at least two deltas exist and a stream is in flight.

The floor exists for burst-and-stall streams. When a provider buffers output and flushes it in one step, every token in the burst lands on nearly the same timestamp and the raw span is close to zero; dividing by that span reports the burst size, not the throughput. Extending the span to the 100 ms floor makes the reading include the gap the provider spent silent. A genuine burst spread over real time keeps its true timestamps and is unaffected.

## Average TPS

Each arriving delta that produces a positive rounded live TPS contributes one sample to a 1000-entry ring. The average is the sum of those readings divided by their count, rounded only for display. Before 1000 samples exist, it uses all available samples; once full, each new sample replaces the oldest. A running sum makes insertion and mean calculation constant-time. This is a sample-count window, not a 1000 ms average or a tokens-per-elapsed-time ratio.

Sampling uses delta arrival time rather than repaint or stream-end events. Idle gaps, empty messages, and insufficient data add no samples, so tool waits do not dilute the average. Repeated renders do not add duplicate samples.

`beginTpsStreaming()` resets the token delta buffer and pause state for each assistant message while preserving the TPS sample ring and displayed readings. The moving average therefore spans message boundaries within the session. `resetTpsTracker()` clears both buffers, the running sum, and displayed readings for a new session.

## Pause and resume

The tracker exposes `pauseTpsTimer()` and `resumeTpsTimer()` to suspend recording around non-generating work. Pausing is a no-op unless a stream is in flight, and double-pause is ignored. These functions are not wired to event handlers. Pending pause state is cleared at stream end and at turn boundaries via `resetTurnPauseAccumulator()`; neither operation clears the moving-average history.

## Reading value

The engine exposes `getPromptlineTpsLabel()` which returns a formatted ANSI string. It returns the stored `lastLiveTps` and `lastAverageTps` during and after streaming; reading the label does not resample elapsed wall time. The method calls `formatPromptlineTpsLabel(current, avg)` from the formatter module, which produces the final styled label: both values in gray, the bolt separator speed-colored by the live figure, and dashes only for metrics without a meaningful reading in the session.

## Memory bound

The token delta buffer compacts when it passes 5000 entries: entries older than twice the live window are dropped. Live TPS only reads the window. The moving average has its own ring, bounded to 1000 numeric samples regardless of session length.
