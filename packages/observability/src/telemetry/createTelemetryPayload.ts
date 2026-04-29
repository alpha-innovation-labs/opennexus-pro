import { createOtlpAttributes } from "./createOtlpAttributes.js";
import { createSpanId } from "./createSpanId.js";
import { createTraceId } from "./createTraceId.js";
import { sanitizeTelemetryAttributes } from "./sanitizeTelemetryAttributes.js";
import type { TelemetryAttributes, TelemetryConfig } from "./types.js";

/**
 * Creates an OTLP JSON trace payload for one Nexus telemetry event.
 *
 * @param config Resolved telemetry configuration.
 * @param name Privacy-reviewed telemetry event name.
 * @param attributes Event attributes that must not contain user content.
 * @returns OTLP JSON trace payload.
 */
export function createTelemetryPayload(
  config: TelemetryConfig,
  name: string,
  attributes: TelemetryAttributes = {},
): Record<string, unknown> {
  const startTimeUnixNano = String(BigInt(Date.now()) * 1_000_000n);
  const safeAttributes = sanitizeTelemetryAttributes({ "event.name": name, ...attributes });
  return {
    resourceSpans: [
      {
        resource: {
          attributes: createOtlpAttributes({
            "service.name": config.serviceName,
            "service.version": config.serviceVersion,
          }),
        },
        scopeSpans: [
          {
            scope: { name: "nexus.telemetry" },
            spans: [
              {
                traceId: createTraceId(),
                spanId: createSpanId(),
                name,
                kind: 1,
                startTimeUnixNano,
                endTimeUnixNano: startTimeUnixNano,
                attributes: createOtlpAttributes(safeAttributes),
                status: { code: 1 },
              },
            ],
          },
        ],
      },
    ],
  };
}
