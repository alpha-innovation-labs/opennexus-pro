import assert from "node:assert/strict";
import test from "node:test";
import { InteractiveMode } from "../../node_modules/@mariozechner/pi-coding-agent/dist/modes/interactive/interactive-mode.js";
import { applyStartupUpdateSilencePatch } from "../../packages/pi-platform/src/applyStartupUpdateSilencePatch.js";

test("startup update silence patch disables version and package update checks", async () => {
  const previousSkipVersionCheck = process.env.PI_SKIP_VERSION_CHECK;
  applyStartupUpdateSilencePatch();

  const prototype = InteractiveMode.prototype as unknown as {
    checkForNewVersion(): Promise<string | undefined>;
    checkForPackageUpdates(): Promise<string[]>;
    showNewVersionNotification(newVersion: string): void;
    showPackageUpdateNotification(packages: string[]): void;
  };
  const notificationTarget = {
    called: false,
    chatContainer: { addChild: () => { notificationTarget.called = true; } },
    ui: { requestRender: () => { notificationTarget.called = true; } },
  };

  assert.equal(process.env.PI_SKIP_VERSION_CHECK, "1");
  assert.equal(await prototype.checkForNewVersion.call({}), undefined);
  assert.deepEqual(await prototype.checkForPackageUpdates.call({}), []);
  prototype.showNewVersionNotification.call(notificationTarget, "999.0.0");
  prototype.showPackageUpdateNotification.call(notificationTarget, ["example"]);
  assert.equal(notificationTarget.called, false);

  if (previousSkipVersionCheck === undefined) delete process.env.PI_SKIP_VERSION_CHECK;
  else process.env.PI_SKIP_VERSION_CHECK = previousSkipVersionCheck;
});
