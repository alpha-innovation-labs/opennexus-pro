import assert from "node:assert/strict";
import test from "node:test";
import { createPanelOverlayOptions } from "../../../packages/extensions/src/overlay/createPanelOverlayOptions.js";

test("panel overlay options keep full-width masking by default", () => {
  assert.deepEqual(createPanelOverlayOptions(80, "85%"), {
    anchor: "center",
    width: "100%",
    minWidth: 80,
    maxHeight: "85%",
  });
});

test("panel overlay options can constrain masking to the modal width", () => {
  assert.deepEqual(createPanelOverlayOptions(80, "85%", { widthMode: "modal" }), {
    anchor: "center",
    width: 80,
    minWidth: 80,
    maxHeight: "85%",
  });
});
