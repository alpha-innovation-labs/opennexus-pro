import assert from "node:assert/strict";
import test from "node:test";
import { getDemoCommand } from "../../../src/wterm-demo/server/getDemoCommand.js";
import { getDemoPtyOptions } from "../../../src/wterm-demo/server/getDemoPtyOptions.js";

test("getDemoCommand returns an interactive shell launch command", () => {
  assert.equal(getDemoCommand("/bin/bash"), "exec '/bin/bash' -il");
});

test("getDemoPtyOptions configures a browser-friendly terminal", () => {
  const options = getDemoPtyOptions();

  assert.equal(options.name, "xterm-256color");
  assert.equal(options.cols, 120);
  assert.equal(options.rows, 32);
  assert.equal(options.env?.TERM, "xterm-256color");
  assert.equal(options.env?.FORCE_COLOR, "1");
});
