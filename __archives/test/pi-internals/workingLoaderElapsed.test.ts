import assert from "node:assert/strict";
import test from "node:test";
import { Loader } from "@earendil-works/pi-tui";
import { applyWorkingLoaderElapsedPatch } from "../../packages/pi-platform/src/applyWorkingLoaderElapsedPatch.js";
import { formatWorkingElapsed } from "../../packages/pi-platform/src/working-loader/formatWorkingElapsed.js";

/**
 * Creates a minimal TUI stub for loader tests.
 *
 * @returns TUI stub.
 */
function createTuiStub() {
  return { requestRender() {} };
}

test("formatWorkingElapsed renders compact elapsed time", () => {
  assert.equal(formatWorkingElapsed(0), "0:00");
  assert.equal(formatWorkingElapsed(65_000), "1:05");
  assert.equal(formatWorkingElapsed(3_661_000), "1:01:01");
});

test("working loader patch prefixes Working indicator with stopwatch elapsed time", () => {
  applyWorkingLoaderElapsedPatch();
  const originalNow = Date.now;
  let now = 100_000;
  Date.now = () => now;

  const loader = new Loader(createTuiStub() as never, (value) => value, (value) => value, "Working...", { frames: ["⠋"] });
  try {
    now = 105_000;
    loader.setMessage("Working...");

    const output = loader.render(80).join("\n");

    assert.match(output, /⠋ ⏱ 0:05 Working\.\.\./u);
  } finally {
    loader.stop();
    Date.now = originalNow;
  }
});
