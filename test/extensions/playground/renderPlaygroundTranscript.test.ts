import assert from "node:assert/strict";
import test from "node:test";
import { renderAssistantEntry } from "../../../packages/mini-apps/src/playground/ui/renderAssistantEntry.js";
import { LinesComponent } from "../../support/component/LinesComponent.js";
import { renderComponentInVirtualTerminal } from "../../support/render/renderComponentInVirtualTerminal.js";
import { initializePiThemes } from "../../support/theme/initializePiThemes.js";

test("playground assistant transcript rendering works in the virtual terminal", async () => {
  await initializePiThemes();
  const viewport = await renderComponentInVirtualTerminal(
    () => new LinesComponent((width) => renderAssistantEntry("**Hello** from playground", width)),
  );

  const output = viewport.join("\n");
  assert.match(output, /Hello/);
  assert.match(output, /playground/);
});
