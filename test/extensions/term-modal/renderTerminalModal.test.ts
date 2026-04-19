import assert from "node:assert/strict";
import test from "node:test";
import { TerminalModal } from "../../../src/extensions/term-modal/ui/TerminalModal.js";
import { renderComponentInVirtualTerminal } from "../../support/render/renderComponentInVirtualTerminal.js";
import { createTestTheme } from "../../support/theme/createTestTheme.js";

test("term-modal renders shell output in the virtual terminal", async () => {
  const fakeXterm = {
    resize() {},
    getDisplayLines() {
      return ["$ echo hi", "hi"];
    },
    lineCount() {
      return 2;
    },
  };
  const fakePty = {
    resize() {},
    kill() {},
    input() {},
    isRunning() {
      return true;
    },
    error() {
      return null;
    },
    pid() {
      return 1234;
    },
  };

  const viewport = await renderComponentInVirtualTerminal(
    (tui) => new TerminalModal(tui, createTestTheme(), "Terminal", fakeXterm as never, fakePty as never, () => undefined),
  );

  const output = viewport.join("\n");
  assert.match(output, /Terminal/);
  assert.match(output, /running/);
  assert.match(output, /echo hi/);
  assert.match(output, /^.*hi.*$/m);
});
