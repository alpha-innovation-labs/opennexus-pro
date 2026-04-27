import assert from "node:assert/strict";
import test from "node:test";
import { SharedModal } from "../../../src/extensions/shared/modal/index.js";
import { renderComponentInVirtualTerminal } from "../../support/render/renderComponentInVirtualTerminal.js";
import { createTestTheme } from "../../support/theme/createTestTheme.js";

test("shared modal renders header panes and footer", async () => {
  const modal = new SharedModal({
    theme: createTestTheme(),
    headerLines: ["○ Main │ ● Spec"],
    footerLines: ["Footer"],
    panes: [
      { id: "left", size: 1, lines: ["Left A", "Left B"] },
      { id: "right", size: 2, lines: ["Right A"] },
    ],
  });

  const viewport = await renderComponentInVirtualTerminal(() => modal, 90, 16);
  const output = viewport.join("\n");

  assert.match(output, /○ Main/);
  assert.match(output, /Left A/);
  assert.match(output, /Right A/);
  assert.match(output, /Footer/);
});
