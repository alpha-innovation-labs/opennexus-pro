import assert from "node:assert/strict";
import test from "node:test";
import { InteractiveMode } from "../../node_modules/@mariozechner/pi-coding-agent/dist/modes/interactive/interactive-mode.js";
import { applyStartupUpdateSilencePatch } from "../../src/pi-internals/applyStartupUpdateSilencePatch.js";

test("startup update silence patch disables version and package update checks", async () => {
  applyStartupUpdateSilencePatch();

  const prototype = InteractiveMode.prototype as InteractiveMode & {
    checkForNewVersion(): Promise<string | undefined>;
    checkForPackageUpdates(): Promise<string[]>;
  };

  assert.equal(await prototype.checkForNewVersion.call({}), undefined);
  assert.deepEqual(await prototype.checkForPackageUpdates.call({}), []);
});
