import assert from "node:assert/strict";
import test from "node:test";
import { getTrackedTelemetryEvents } from "../../packages/observability/src/telemetry/getTrackedTelemetryEvents.js";

const expectedEventIds = [
  "app.start",
  "app.exit",
  "command.used",
  "extension.used",
  "provider.category.selected",
  "startup.duration",
  "session.started",
  "model.category.switched",
  "tool.error",
  "app.crash",
  "update.install.result",
];

test("telemetry registry contains one entry for each planned Nexus event", () => {
  const events = getTrackedTelemetryEvents();
  assert.deepEqual(events.map((event) => event.id), expectedEventIds);
});

test("telemetry registry descriptions reject user content collection", () => {
  const descriptionText = getTrackedTelemetryEvents().map((event) => event.description).join("\n");
  assert.match(descriptionText, /without command arguments or user content/u);
  assert.match(descriptionText, /without prompt, response, or provider credential data/u);
  assert.match(descriptionText, /not tool inputs, file paths, or outputs/u);
});
