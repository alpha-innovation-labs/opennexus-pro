# Event wiring

The engine is stateless until fed from pi lifecycle events. Each event maps to one engine operation; the mapping is the whole interface between the agent loop and the measurement.

## The mapping

| Pi event | Engine operation |
|---|---|
| `session_start` | `resetTpsTracker` — clears the token buffer, TPS sample ring and running sum, pause state, and displayed readings for the new session. |
| `message_start` (assistant) | `beginTpsStreaming` + register the 500 ms refresh request — resets measurement for the new message but retains displayed readings. |
| `message_update` | `recordTpsDelta(delta.delta.length / 4)` per streaming delta for `text_delta`, `thinking_delta`, and `toolcall_delta`. The first delta of a stream opens the generating window; tokens are estimated from text length. Each meaningful live reading enters the 1000-sample moving average; insufficient data adds no sample. |
| `message_end` (assistant) | `endTpsStreaming` — closes the generating window without resampling or clearing retained readings. Clear the refresh request. |
| `turn_end` | `resetTurnPauseAccumulator` — clears any stale pause state for the next turn without clearing the sample history. |
| `session_shutdown` | Clear the refresh request. |

## The refresh cadence

The renderer does not redraw on every delta. A refresh request is registered with the engine, and while a stream is in flight the engine fires it on a 500 ms interval; clearing the request stops the interval. High-throughput streams therefore produce a steady label instead of a flickering one. Calculations occur on delta arrival, so even a stream ending before the first refresh tick retains its latest meaningful readings; only rendering is throttled.

## Why estimate-based counting

The engine estimates tokens from delta text length (divided by 4) rather than counting one token per delta. Providers do not expose per-delta token counts, so the estimate is the available signal. The label is a throughput hint, not a billing number, and the estimate is stable enough for the display precision shown.
