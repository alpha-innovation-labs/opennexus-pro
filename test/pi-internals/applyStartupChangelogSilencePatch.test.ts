import assert from "node:assert/strict";
import test from "node:test";
import { InteractiveMode } from "../../node_modules/@mariozechner/pi-coding-agent/dist/modes/interactive/interactive-mode.js";
import { applyStartupChangelogSilencePatch } from "../../src/pi-internals/applyStartupChangelogSilencePatch.js";

test("startup changelog silence patch disables startup changelog and install telemetry", () => {
  applyStartupChangelogSilencePatch();

  const prototype = InteractiveMode.prototype as InteractiveMode & {
    getChangelogForDisplay(): string | undefined;
    reportInstallTelemetry(version: string): void;
  };

  assert.equal(prototype.getChangelogForDisplay.call({}), undefined);
  assert.equal(prototype.reportInstallTelemetry.call({}, "0.68.0"), undefined);
});
