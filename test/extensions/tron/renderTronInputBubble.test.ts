import assert from "node:assert/strict";
import test from "node:test";
import { renderCompactInputBubble } from "../../../src/extensions/tron/user-message/renderCompactInputBubble.js";
import { LinesComponent } from "../../support/component/LinesComponent.js";
import { renderComponentInVirtualTerminal } from "../../support/render/renderComponentInVirtualTerminal.js";
import { initializePiThemes } from "../../support/theme/initializePiThemes.js";

test("tron user message bubble renders in the virtual terminal", async () => {
  await initializePiThemes();
  const viewport = await renderComponentInVirtualTerminal(
    () => new LinesComponent((width) => renderCompactInputBubble("Plan the refactor", width)),
  );

  const output = viewport.join("\n");
  assert.match(output, /Plan the refactor/);
  assert.match(output, /╭/);
  assert.match(output, /╰/);
});
