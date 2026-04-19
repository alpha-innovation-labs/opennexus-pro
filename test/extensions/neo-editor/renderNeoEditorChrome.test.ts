import assert from "node:assert/strict";
import test from "node:test";
import { renderBottomBorderLabel } from "../../../src/extensions/neo-editor/ui/renderBottomBorderLabel.js";
import { renderPromptlineBorder } from "../../../src/extensions/neo-editor/ui/renderPromptlineBorder.js";
import { renderUsageText } from "../../../src/extensions/neo-editor/ui/renderUsageText.js";
import { LinesComponent } from "../../support/component/LinesComponent.js";
import { renderComponentInVirtualTerminal } from "../../support/render/renderComponentInVirtualTerminal.js";
import { createTestTheme } from "../../support/theme/createTestTheme.js";

test("neo-editor chrome renders promptline and usage in the virtual terminal", async () => {
  const theme = createTestTheme();
  const border = (value: string) => value;

  const viewport = await renderComponentInVirtualTerminal(
    () => new LinesComponent((width) => {
      const innerWidth = width - 2;
      const promptline = renderPromptlineBorder(border, theme, innerWidth, {
        left: "~/workspace/nexus-tui-awesome",
        right: "ctx 3%",
      });
      const usage = renderBottomBorderLabel(border, theme, innerWidth, renderUsageText(theme, "◔ 25% | ◕ 60%"));
      return [`╭${promptline}╮`, `│${" ".repeat(innerWidth)}│`, `╰${usage}╯`];
    }),
  );

  const output = viewport.join("\n");
  assert.match(output, /nexus-tui-awesome/);
  assert.match(output, /ctx 3%/);
  assert.match(output, /◔ 25%/);
  assert.match(output, /◕ 60%/);
});
