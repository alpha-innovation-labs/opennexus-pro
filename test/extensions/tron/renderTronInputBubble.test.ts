import assert from "node:assert/strict";
import test from "node:test";
import { renderCompactInputBubble } from "../../../packages/extension-core/src/tron/user-message/renderCompactInputBubble.js";
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

test("tron user message bubble renders only time on the bottom border", async () => {
  await initializePiThemes();
  const viewport = await renderComponentInVirtualTerminal(
    () => new LinesComponent((width) => renderCompactInputBubble("Plan the refactor", width, {
      timestamp: new Date(2026, 3, 14, 14, 56),
      now: new Date(2026, 3, 14, 15, 34),
    })),
  );

  const bodyLine = viewport.find((line) => line.includes("Plan the refactor")) ?? "";
  const bottomLine = viewport.find((line) => line.includes("2:56 PM")) ?? "";
  assert.doesNotMatch(bodyLine, /2:56 PM/);
  assert.match(bottomLine, /2:56 PM/);
  assert.doesNotMatch(bottomLine, /claude-sonnet-4|high|thinking|anthropic/);
});
