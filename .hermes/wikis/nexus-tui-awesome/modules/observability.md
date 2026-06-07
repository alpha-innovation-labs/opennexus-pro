# Module: `packages/observability`

OpenTelemetry-based telemetry system. Tracks user actions, sends sanitized attributes to PostHog, and provides per-feature toggle configuration.

## Responsibilities

- OpenTelemetry event tracking: spans, traces, attributes
- Sanitization: key/value cleaning for GDPR compliance
- Feature toggles: per-event enable/disable configuration
- PostHog integration: OTLP payload creation and safe sending

## Key Files

- `src/telemetry/createTelemetryConfig.ts` — OTLP configuration setup
- `src/telemetry/createTelemetryPayload.ts` — Constructs OTLP payload from events
- `src/telemetry/sanitizeTelemetryKey.ts` — Cleans telemetry keys for compliance
- `src/telemetry/sanitizeTelemetryValue.ts` — Cleans telemetry values for compliance
- `src/telemetry/sanitizeTelemetryAttributes.ts` — Batch attribute sanitization
- `src/telemetry/sendTelemetryEvent.ts` — Direct event sending
- `src/telemetry/sendTelemetryEventSafely.ts` — Safe event sending with error handling
- `src/telemetry/getErrorCategory.ts` — Categorizes errors for tracking
- `src/telemetry/trackedTelemetryEvents.ts` — Whitelist of tracked events
- `src/telemetry/disabledTelemetryEvents.ts` — Disabled event configuration
- `src/posthog/` — PostHog-specific integration layer
- `src/startup-profile/` — Startup performance profiling

## Public API

### `sendTelemetryEvent(event: TelemetryEvent, attributes: Attributes) → Promise<void>`
Sends a telemetry event with sanitized attributes via OTLP.

### `sendTelemetryEventSafely(...) → Promise<void>`
Safe wrapper around `sendTelemetryEvent` with error handling and fallback.

### `getErrorCategory(error: Error) → string`
Categorizes errors for telemetry tracking.

### `sanitizeTelemetryAttributes(attributes: Attributes) → SanitizedAttributes`
Sanitizes all attributes for GDPR compliance.

## Internal Structure

Telemetry in `src/telemetry/`, PostHog integration in `src/posthog/`, startup profiling in `src/startup-profile/`. Each module is self-contained with clear boundaries.

## Dependencies

- **Uses:** No external runtime dependencies (pure telemetry layer)
- **Used by:** `apps/tui` (all telemetry events), `@nexus/mini-apps` (daemon lifecycle events)

## Notable Patterns / Gotchas

- Events are whitelisted via `trackedTelemetryEvents.ts`; only tracked events are sent
- Per-feature toggles controlled by `setTelemetryEventEnabled` / `getTelemetryEventToggles`
- Safe sending catches all errors to prevent crashes from telemetry failures
- Startup profile tracks performance metrics for CLI boot time
