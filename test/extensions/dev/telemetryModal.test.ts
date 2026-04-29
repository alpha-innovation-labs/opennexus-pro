import assert from "node:assert/strict";
import test from "node:test";
import { setTelemetryEventEnabled } from "../../../packages/observability/src/telemetry/setTelemetryEventEnabled.js";
import { TelemetryModal } from "../../../packages/extensions/src/dev/telemetry/TelemetryModal.js";
import { renderComponentInVirtualTerminal } from "../../support/render/renderComponentInVirtualTerminal.js";
import { createTestTheme } from "../../support/theme/createTestTheme.js";

test("/telemetry modal renders tracked events in a virtual terminal", async () => {
  const viewport = await renderComponentInVirtualTerminal(
    () => new TelemetryModal(createTestTheme(), () => {}),
    140,
    30,
  );
  const output = viewport.join("\n");

  assert.match(output, /Telemetry/u);
  assert.match(output, /App start/u);
  assert.match(output, /App exit/u);
  assert.match(output, /Enter\/space toggles selected event/u);
  assert.match(output, /┘/u);
  assert.doesNotMatch(output, /Event details/u);
});

test("/telemetry modal toggles the selected telemetry event", () => {
  setTelemetryEventEnabled("app.start", true);
  const modal = new TelemetryModal(createTestTheme(), () => {});

  modal.handleInput("\r");
  const disabledOutput = modal.render(140).join("\n");
  modal.handleInput("\r");
  const enabledOutput = modal.render(140).join("\n");

  assert.match(disabledOutput, /○ App start/u);
  assert.match(enabledOutput, /● App start/u);
});
