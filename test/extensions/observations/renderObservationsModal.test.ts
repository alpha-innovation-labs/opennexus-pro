import assert from "node:assert/strict";
import test from "node:test";
import { ObservationsModal } from "../../../packages/extensions/src/observations/command/ObservationsModal.js";
import { renderComponentInVirtualTerminal } from "../../support/render/renderComponentInVirtualTerminal.js";
import { createTestTheme } from "../../support/theme/createTestTheme.js";

test("observations modal renders topics and preview details in the virtual terminal", async () => {
  const items = [{ label: "Topic A", value: "topic-a", description: "1 item" }];
  const details = new Map([["topic-a", ["Observation detail line"]]]);

  const viewport = await renderComponentInVirtualTerminal(
    () => new ObservationsModal(createTestTheme(), items, details, () => undefined),
  );

  const output = viewport.join("\n");
  assert.match(output, /Topics/);
  assert.match(output, /Observations/);
  assert.match(output, /Topic A/);
  assert.match(output, /Observation detail line/);
});
