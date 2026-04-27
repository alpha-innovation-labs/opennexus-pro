import assert from "node:assert/strict";
import test from "node:test";
import { getE2eCommand } from "../../../apps/wterm-e2e/src/server/getE2eCommand.js";
import { getE2ePtyOptions } from "../../../apps/wterm-e2e/src/server/getE2ePtyOptions.js";

test("getE2eCommand returns an interactive shell launch command", () => {
  assert.equal(getE2eCommand("/bin/bash"), "exec '/bin/bash' -il");
});

test("getE2ePtyOptions configures a browser-friendly terminal", () => {
  const options = getE2ePtyOptions();

  assert.equal(options.name, "xterm-256color");
  assert.equal(options.cols, 120);
  assert.equal(options.rows, 32);
  assert.equal(options.env?.TERM, "xterm-256color");
  assert.equal(options.env?.FORCE_COLOR, "1");
});
