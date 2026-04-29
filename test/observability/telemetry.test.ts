import assert from "node:assert/strict";
import test from "node:test";
import { createTelemetryConfig } from "../../packages/observability/src/telemetry/createTelemetryConfig.js";
import { createTelemetryPayload } from "../../packages/observability/src/telemetry/createTelemetryPayload.js";
import { sanitizeTelemetryAttributes } from "../../packages/observability/src/telemetry/sanitizeTelemetryAttributes.js";
import { sendTelemetryEvent } from "../../packages/observability/src/telemetry/sendTelemetryEvent.js";
import { setTelemetryEventEnabled } from "../../packages/observability/src/telemetry/setTelemetryEventEnabled.js";
import type { TelemetryConfig } from "../../packages/observability/src/telemetry/types.js";

const enabledConfig: TelemetryConfig = {
  enabled: true,
  endpoint: "https://example.test/otel/v2/traces",
  serviceName: "nexus-test",
  serviceVersion: "0.0.0-test",
};

/**
 * Creates a successful fetch response for telemetry sender tests.
 *
 * @returns Successful response object.
 */
function createOkResponse(): Response {
  return new Response("{}", { status: 200 });
}

test("createTelemetryConfig enables telemetry by default", () => {
  assert.equal(createTelemetryConfig({}).enabled, true);
});

test("sanitizeTelemetryAttributes removes unsafe keys and values", () => {
  assert.deepEqual(
    sanitizeTelemetryAttributes({
      " event name ": "x".repeat(250),
      "bad key!": true,
      missing: undefined,
      infinite: Number.POSITIVE_INFINITY,
    }),
    {
      "event_name": "x".repeat(200),
      "bad_key_": true,
    },
  );
});

test("createTelemetryPayload emits OTLP JSON without user content fields", () => {
  const payload = createTelemetryPayload(enabledConfig, "app.start", { "os.platform": "darwin" });
  const json = JSON.stringify(payload);
  assert.match(json, /"service.name"/);
  assert.match(json, /"nexus-test"/);
  assert.match(json, /"app.start"/);
  assert.doesNotMatch(json, /prompt|transcript|api_key|path/);
});

test("sendTelemetryEvent skips network when disabled", async () => {
  let calls = 0;
  const sent = await sendTelemetryEvent("app.start", {}, { ...enabledConfig, enabled: false }, async () => {
    calls += 1;
    return createOkResponse();
  });
  assert.equal(sent, false);
  assert.equal(calls, 0);
});

test("sendTelemetryEvent posts OTLP JSON when enabled", async () => {
  let requestBody = "";
  const sent = await sendTelemetryEvent("app.start", {}, enabledConfig, async (_input, init) => {
    requestBody = String(init.body);
    return createOkResponse();
  });
  assert.equal(sent, true);
  assert.match(requestBody, /app.start/);
});

test("sendTelemetryEvent skips disabled tracked events", async () => {
  let calls = 0;
  setTelemetryEventEnabled("app.start", false);
  const sent = await sendTelemetryEvent("app.start", {}, enabledConfig, async () => {
    calls += 1;
    return createOkResponse();
  });
  setTelemetryEventEnabled("app.start", true);
  assert.equal(sent, false);
  assert.equal(calls, 0);
});

test("createTelemetryPayload includes safe terminal metadata", () => {
  const payload = createTelemetryPayload(enabledConfig, "app.start", {
    "terminal.term": "xterm-256color",
    "terminal.program": "Apple_Terminal",
    "terminal.color": "truecolor",
    "terminal.wt_session": true,
  });
  const json = JSON.stringify(payload);
  assert.match(json, /terminal.term/);
  assert.match(json, /terminal.program/);
  assert.match(json, /terminal.color/);
  assert.match(json, /terminal.wt_session/);
});
