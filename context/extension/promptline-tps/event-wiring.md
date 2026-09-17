# Event wiring

The engine is stateless until fed from pi lifecycle events. Each event maps to one engine operation; the mapping is the whole interface between the agent loop and the measurement.

## The mapping

| Pi event | Engine operation |
|---|---|
| `session_start` | `resetTpsTracker` — clears the buffer, totals, pause state, and last readings for the new session. |
| `message_start` (assistant) | `resetTpsTracker` + register the 500 ms refresh request — the stream is starting. |
| `message_update` | `recordTpsDelta(delta.delta.length / 4)` per streaming delta for `text_delta`, `thinking_delta`, and `toolcall_delta`. The first delta of a stream opens the generating window; tokens are estimated from text length. |
| `message_end` (assistant) | `endTpsStreaming` — snapshots both readings and closes the generating window. Clear the refresh request. |
| `turn_end` | `resetTurnPauseAccumulator` — clears any stale pause state for the next turn. |
| `session_shutdown` | Clear the refresh request. |

## The refresh cadence

The renderer does not redraw on every delta. A refresh request is registered with the engine, and while a stream is in flight the engine fires it on a 500 ms interval; clearing the request stops the interval. High-throughput streams therefore produce a steady label instead of a flickering one, and the calculation is unaffected by the cadence — only rendering is throttled.

## Why estimate-based counting

The engine estimates tokens from delta text length (divided by 4) rather than counting one token per delta. Providers do not expose per-delta token counts, so the estimate is the available signal. The label is a throughput hint, not a billing number, and the estimate is stable enough for the display precision shown.
